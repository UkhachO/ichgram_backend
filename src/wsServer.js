import http from 'node:http';
import { Server } from 'socket.io';
import { verifyAccessToken } from './utils/tokens.js';
import { setIO, getIO } from './utils/ws.js';
import * as messageService from './services/message.service.js';

const cleanToken = (raw) => (raw ? String(raw).trim() : raw);

const startWsServer = () => {
  const ioPort = Number(process.env.SOCKET_IO_PORT || 4000);

  const httpServer = http.createServer((_req, _res) => {});

  const origins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (!origins.length || origins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  setIO(io);

  io.use((socket, next) => {
    try {
      const qToken = socket.handshake.query?.token;
      const hAuth = socket.handshake.headers?.authorization || '';

      const headerToken = hAuth.startsWith('Bearer ') ? hAuth.slice(7) : '';
      const token = cleanToken(qToken || headerToken);

      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyAccessToken(token);
      socket.userId = payload.id;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('message:send', async ({ to, text }, cb) => {
      try {
        const doc = await messageService.sendMessage({
          fromId: socket.userId,
          toId: to,
          text: String(text || '').trim(),
        });

        io.to(`user:${socket.userId}`).emit('message:new', doc);
        io.to(`user:${to}`).emit('message:new', doc);

        cb?.({ ok: true, data: doc });
      } catch (e) {
        cb?.({ ok: false, message: e.message || 'Send failed' });
      }
    });

    socket.on('typing', ({ to }) => {
      io.to(`user:${to}`).emit('typing', { from: socket.userId });
    });
  });

  httpServer.listen(ioPort, () => {
    console.log(`wsServer listening on ${ioPort}`);
  });
};

export default startWsServer;
