import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

import authRouter from './routers/auth.router.js';
import fileRouter from './routers/file.router.js';
import postRouter from './routers/post.router.js';
import userRoutes from './routers/user.router.js';
import exploreRoutes from './routers/explore.router.js';
import messageRouter from './routers/message.router.js';
import followRouter from './routers/follow.router.js';
import notificationRouter from './routers/notification.router.js';

const startServer = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:5173'],
      credentials: false,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/files', fileRouter);
  app.use('/api/posts', postRouter);
  
  app.use('/api/users', userRoutes);
  app.use('/api/explore', exploreRoutes);

  app.use('/api/messages', messageRouter);

  app.use('/api/follows', followRouter);

  app.use('/api/notifications', notificationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Server running on ${port} port`));
};

export default startServer;
