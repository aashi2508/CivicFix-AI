import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { db } from '../services/db';
import { hashPassword, signToken, verifyPassword } from '../services/auth';
import { emitToAdmins } from '../services/realtime';

const r = Router();

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  name: z.string().min(2).max(100).optional(),
});

// POST /api/auth/register
r.post('/register', async (req, res, next) => {
  try {
    const p = credentials.parse(req.body);
    const email = p.email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email } });

    if (existing) {
      // If user already registered, update password hash & return active session
      const updated = await db.user.update({
        where: { id: existing.id },
        data: {
          name: p.name || existing.name,
          passwordHash: await hashPassword(p.password),
        },
      });

      emitToAdmins('user:registered', {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt,
      });

      return res.status(200).json({
        token: signToken(updated.id, updated.role),
        user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
      });
    }

    const u = await db.user.create({
      data: {
        email,
        name: p.name ?? email.split('@')[0],
        passwordHash: await hashPassword(p.password),
        role: Role.CITIZEN,
      },
    });

    emitToAdmins('user:registered', {
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    });

    res.status(201).json({
      token: signToken(u.id, u.role),
      user: { id: u.id, email: u.email, name: u.name, role: u.role },
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login
r.post('/login', async (req, res, next) => {
  try {
    const p = credentials.pick({ email: true, password: true }).parse(req.body);
    const email = p.email.toLowerCase().trim();
    const u = await db.user.findUnique({ where: { email } });

    if (!u) {
      // Auto-register citizen if they sign in for the first time
      const autoUser = await db.user.create({
        data: {
          email,
          name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
          passwordHash: await hashPassword(p.password),
          role: Role.CITIZEN,
        },
      });

      emitToAdmins('user:registered', {
        id: autoUser.id,
        name: autoUser.name,
        email: autoUser.email,
        createdAt: autoUser.createdAt,
      });

      return res.status(201).json({
        token: signToken(autoUser.id, autoUser.role),
        user: { id: autoUser.id, email: autoUser.email, name: autoUser.name, role: autoUser.role },
      });
    }

    // If admin, enforce strict password check
    if (u.role === Role.ADMIN) {
      const match = await verifyPassword(p.password, u.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid administrator credentials' });
      }
    } else {
      // For citizens, verify or update password if valid
      const match = await verifyPassword(p.password, u.passwordHash);
      if (!match) {
        await db.user.update({
          where: { id: u.id },
          data: { passwordHash: await hashPassword(p.password) },
        });
      }
    }

    res.json({
      token: signToken(u.id, u.role),
      user: { id: u.id, email: u.email, name: u.name, role: u.role },
    });
  } catch (e) {
    next(e);
  }
});

export { r as authRouter };
