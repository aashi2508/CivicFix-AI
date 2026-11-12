import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { parseToken } from './auth';

let io: Server | null = null;
const onlineUsers = new Map<string, Set<string>>();

export function initRealtime(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN ?? '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Authentication required'));
      const decoded = parseToken(token);
      socket.data.user = { id: decoded.sub, role: decoded.role };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id as string;
    const isCitizen = socket.data.user.role === 'CITIZEN';
    if (isCitizen) {
      const sockets = onlineUsers.get(userId) ?? new Set<string>();
      sockets.add(socket.id);
      onlineUsers.set(userId, sockets);
      emitPresence();
    }

    socket.on('disconnect', () => {
      if (!isCitizen) return;
      const current = onlineUsers.get(userId);
      current?.delete(socket.id);
      if (current?.size === 0) onlineUsers.delete(userId);
      emitPresence();
    });
  });
  return io;
}

function emitPresence() {
  io?.to('admins').emit('presence:update', { onlineUsers: onlineUsers.size });
}

export function emitToAdmins(event: string, payload: unknown) {
  io?.to('admins').emit(event, payload);
}

export function getOnlineUserCount() {
  return onlineUsers.size;
}
