import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config';
export async function hashPassword(value: string) { return bcrypt.hash(value, 12); }
export async function verifyPassword(value: string, hash: string) { return bcrypt.compare(value, hash); }
export function signToken(id: string, role: Role) { return jwt.sign({ sub: id, role }, config.jwtSecret, { expiresIn: '7d' }); }
export function parseToken(token: string) { return jwt.verify(token, config.jwtSecret) as { sub: string; role: Role }; }
