import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth';
import { complaintRouter } from './routes/complaints';
import { adminRouter } from './routes/admin';
import { errorHandler, notFound } from './middleware/errors';
import path from 'path';
import { config } from './config';
import { Server } from 'http';
import { initRealtime } from './services/realtime';

export const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin === '*' ? '*' : config.corsOrigin }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.resolve(config.uploadDir), { index: false })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'civicfix-backend' }));
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintRouter);
app.use('/api/admin', adminRouter);
app.use(notFound);
app.use(errorHandler);

export function startHttpServer() {
  const server = new Server(app);
  const io = initRealtime(server);
  io.on('connection', (socket) => {
    if (socket.data.user?.role === 'ADMIN') socket.join('admins');
  });
  server.listen(config.port, () => console.log(`CivicFix API listening on ${config.port}`));
  return server;
}
