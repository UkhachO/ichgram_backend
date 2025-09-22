import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from "./middlewares/error.js"; 

const startServer = async () => {
  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL?.split(',') || 'http://localhost:5173',
      credentials: false, 
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);

app.use(errorHandler);

  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => console.log(`Server running on ${port} port`));
};

export default startServer;