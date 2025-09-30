import http from 'node:http';
import { Server } from 'socket.io';
import { verifyAccessToken } from './utils/tokens.js';
import { setIO } from './utils/ws.js';
import * as messageService from './services/message.service.js';

const cleanToken = (raw) => {
  if (!raw) return null;
  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
};

const startWsServer = async () => {
  const ioPort = Number(process.env.SOCKET_IO_PORT || 4000);

  const httpServer = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('ichgram ws server');
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL?.split(',') || '*',
      credentials: true,
    },
    transports: ['websocket'],
  });

  setIO(io);

  io.use((socket, next) => {
    try {
      const token = cleanToken(socket.handshake.auth?.token);
      if (!token) return next(new Error('No token'));
      const payload = verifyAccessToken(token); 
      socket.userId = payload.sub;
      socket.join(`user:${socket.userId}`); 
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
   
    socket.emit('ready', { userId: socket.userId });

    socket.on('message:send', async (data, cb) => {
      try {
        const { to, text } = data || {};
        const msg = await messageService.sendMessage({
          fromId: socket.userId,
          toId: to,
          text,
        });

        io.to(`user:${socket.userId}`).emit('message:new', msg);
        io.to(`user:${to}`).emit('message:new', msg);

        cb?.({ ok: true, data: msg });
      } catch (e) {
        cb?.({ ok: false, message: e.message || 'Send failed' });
      }
    });

    socket.on('typing', ({ to }) => {
      io.to(`user:${to}`).emit('typing', { from: socket.userId });
    });

    socket.on('disconnect', () => {});
  });

  httpServer.listen(ioPort, () =>
    console.log(`Socket.io listening on ${ioPort} port`)
  );
};

export default startWsServer;
