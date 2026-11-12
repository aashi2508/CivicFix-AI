import { RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { parseToken } from '../services/auth';
export const requireAuth: RequestHandler = (req, res, next) => { try { const h = req.headers.authorization; if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' }); const t = parseToken(h.slice(7)); req.user = { id: t.sub, role: t.role }; next(); } catch { res.status(401).json({ error: 'Invalid or expired token' }); } };
export const requireRole = (...roles: Role[]): RequestHandler => (req, res, next) => req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });
