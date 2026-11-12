import { Router } from 'express'; import { z } from 'zod'; import { Role, ComplaintStatus, AIReviewState, ComplaintPriority } from '@prisma/client'; import { db } from '../services/db'; import { requireAuth, requireRole } from '../middleware/auth'; import { aiService } from '../services/ai'; import path from 'path'; import { config } from '../config';
import { emitToAdmins, getOnlineUserCount } from '../services/realtime';
const r = Router(); r.use(requireAuth, requireRole(Role.ADMIN));
r.get('/dashboard', async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalUsers, usersToday, totalComplaints, byStatus, recentComplaints] = await Promise.all([
      db.user.count({ where: { role: Role.CITIZEN } }),
      db.user.count({ where: { role: Role.CITIZEN, createdAt: { gte: today } } }),
      db.complaint.count(),
      db.complaint.groupBy({ by: ['status'], _count: { _all: true } }),
      db.complaint.findMany({ take: 6, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, category: true, status: true, priority: true, createdAt: true, user: { select: { name: true, email: true } } } }),
    ]);
    res.json({ totalUsers, usersToday, onlineUsers: getOnlineUserCount(), totalComplaints, byStatus, recentComplaints, generatedAt: new Date().toISOString() });
  } catch (e) { next(e); }
});
r.get('/users', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim();
    const roleQuery = req.query.role ? String(req.query.role).toUpperCase() : undefined;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
    const where: any = {
      ...(roleQuery ? { role: roleQuery as Role } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }] } : {}),
    };
    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { complaints: true } },
        },
      }),
    ]);
    res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
});
r.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.user.findFirst({ where: { id: String(req.params.id), role: Role.CITIZEN }, select: { id: true, name: true, email: true, createdAt: true, complaints: { orderBy: { createdAt: 'desc' }, select: { id: true, title: true, category: true, status: true, priority: true, createdAt: true } } } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
});
r.get('/queue', async (req, res, next) => { try { const status = req.query.status ? z.nativeEnum(ComplaintStatus).parse(String(req.query.status)) : ComplaintStatus.SUBMITTED; res.json(await db.complaint.findMany({ where: { status }, orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true, email: true } } } })); } catch (e) { next(e); } });
const getComplaint = (id: string) => db.complaint.findUniqueOrThrow({ where: { id }, include: { aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 } } });
r.post('/complaints/:id/ai-review', async (req, res, next) => { try { const c = await getComplaint(String(req.params.id)); const result = await aiService.review({ title: c.title, description: c.description, category: c.category, latitude: c.latitude, longitude: c.longitude, address: c.address, photoPath: c.photoUrl ? path.resolve(c.photoUrl.replace(/^\/uploads[\\/]/, config.uploadDir + path.sep)) : null }); const duplicateSuggestions = c.latitude == null || c.longitude == null ? [] : await db.complaint.findMany({ where: { id: { not: c.id }, category: result.category, latitude: { gte: c.latitude - 0.003, lte: c.latitude + 0.003 }, longitude: { gte: c.longitude - 0.003, lte: c.longitude + 0.003 } }, select: { id: true, title: true, status: true, latitude: true, longitude: true }, take: 10 }); const updated = await db.$transaction(async tx => { const u = await tx.complaint.update({ where: { id: c.id }, data: { aiCategory: result.category, aiSummary: result.summary, status: ComplaintStatus.IN_REVIEW } }); const analysis = await tx.aIAnalysis.create({ data: { complaintId: c.id, category: result.category, summary: result.summary, priority: result.priority as ComplaintPriority, confidence: result.confidence, reason: result.reason, needsHumanReview: result.needsHumanReview, provider: result.provider, model: result.model, state: result.needsHumanReview ? AIReviewState.NEEDS_HUMAN_REVIEW : AIReviewState.COMPLETED } }); if (c.status !== ComplaintStatus.IN_REVIEW) await tx.statusHistory.create({ data: { complaintId: c.id, fromStatus: c.status, toStatus: ComplaintStatus.IN_REVIEW, changedById: req.user!.id, notes: 'AI review completed; administrator approval required' } }); return { complaint: u, analysis }; }); emitToAdmins('complaint:updated', updated.complaint); res.json({ ...updated, duplicateSuggestions }); } catch (e) { next(e); } });
r.post('/complaints/:id/ai-approve', async (req, res, next) => { try { const c = await getComplaint(String(req.params.id)); const analysis = c.aiAnalyses[0]; if (!analysis) return res.status(409).json({ error: 'No AI analysis is available for approval' }); const updated = await db.aIAnalysis.update({ where: { id: analysis.id }, data: { state: AIReviewState.APPROVED, reviewedById: req.user!.id, reviewNote: z.object({ note: z.string().max(2000).optional() }).parse(req.body).note } }); emitToAdmins('ai:reviewed', { complaintId: c.id, analysis: updated }); res.json({ analysis: updated, message: 'AI suggestion approved by administrator; no official decision was made.' }); } catch (e) { next(e); } });
r.patch('/complaints/:id/correction', async (req, res, next) => { try { const p = z.object({ category: z.string().min(2).max(60).optional(), priority: z.nativeEnum(ComplaintPriority).optional(), correctionNote: z.string().max(2000).optional() }).parse(req.body); const c = await db.complaint.update({ where: { id: String(req.params.id) }, data: p }); const analysis = await db.aIAnalysis.findFirst({ where: { complaintId: c.id }, orderBy: { createdAt: 'desc' } }); if (analysis) await db.aIAnalysis.update({ where: { id: analysis.id }, data: { state: AIReviewState.CORRECTED, reviewedById: req.user!.id, reviewNote: p.correctionNote } }); emitToAdmins('complaint:updated', c); res.json(c); } catch (e) { next(e); } });
r.patch('/complaints/:id/status', async (req, res, next) => { try { const p = z.object({ status: z.nativeEnum(ComplaintStatus), notes: z.string().max(2000).optional() }).parse(req.body); const c = await db.complaint.findUniqueOrThrow({ where: { id: String(req.params.id) } }); const updated = await db.$transaction(async tx => { const u = await tx.complaint.update({ where: { id: c.id }, data: { status: p.status } }); await tx.complaintsReview.create({ data: { complaintId: c.id, adminId: req.user!.id, decision: p.status, notes: p.notes } }); await tx.statusHistory.create({ data: { complaintId: c.id, fromStatus: c.status, toStatus: p.status, changedById: req.user!.id, notes: p.notes } }); return u; }); emitToAdmins('complaint:updated', updated); res.json(updated); } catch (e) { next(e); } });
r.get('/analytics', async (_req, res, next) => { try { const [total, grouped] = await Promise.all([db.complaint.count(), db.complaint.groupBy({ by: ['status'], _count: { _all: true } })]); res.json({ total, byStatus: grouped }); } catch (e) { next(e); } });
r.get('/profile', async (req, res, next) => {
  try {
    const u = await db.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(u || { name: 'CivicFix Admin', email: 'admin@civicfix.org', role: 'ADMIN' });
  } catch (e) { next(e); }
});
r.patch('/profile', async (req, res, next) => {
  try {
    const p = z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
    }).parse(req.body);
    const updated = await db.user.update({
      where: { id: req.user!.id },
      data: {
        ...(p.name ? { name: p.name } : {}),
        ...(p.email ? { email: p.email } : {}),
      },
      select: { id: true, name: true, email: true, role: true },
    });
    emitToAdmins('admin:profile_updated', updated);
    res.json(updated);
  } catch (e) { next(e); }
});
export { r as adminRouter };
