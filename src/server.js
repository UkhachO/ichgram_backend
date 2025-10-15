import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import notFound from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

import authRouter from './routers/auth.router.js';
import fileRouter from './routers/file.router.js';
import postRouter from './routers/post.router.js';
import userRouter from './routers/user.router.js';
import exploreRouter from './routers/explore.router.js';
import messageRouter from './routers/message.router.js';
import followRouter from './routers/follow.router.js';
import notificationRouter from './routers/notification.router.js';


const buildCors = () => {
  const normalize = (u) => u?.toLowerCase().replace(/\/+$/, '');

  const list = (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => normalize(s))
    .filter(Boolean);

  // Дозволяємо локалку та прев’ю-домени Vercel
  const allowRegex = [/\.vercel\.app$/i];

  const cfg = {
    origin(origin, cb) {
      if (!origin) return cb(null, true); // дозволити Postman/серверні запити

      const o = normalize(origin);
      const allowed = list.includes(o) || allowRegex.some((re) => re.test(o));

      if (allowed) return cb(null, true);
      console.warn(`❌ Blocked by CORS: ${origin}`);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  return cfg;
};

const startServer = () => {
  const app = express();

  app.use(cors(buildCors()));
  app.disable('x-powered-by');
  app.use(helmet());

  if (process.env.NODE_ENV !== 'production') {
    app.set('env', 'dev');
  }


  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use('/api/auth', authRouter);
  app.use('/api/files', fileRouter);
  app.use('/api/users', userRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/explore', exploreRouter);
  app.use('/api/messages', messageRouter);
  app.use('/api/follows', followRouter);
  app.use('/api/notifications', notificationRouter);

  app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

  app.use(notFound);
  app.use(errorHandler);

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Server listening on ${port}`));
};

export default startServer;
