const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: (process.env.JWT_SECRET || '').trim(),
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  cors: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
};

if (!config.mongoUri) {
  console.warn('[config] MONGO_URI is not set');
}
if (!config.jwtSecret) {
  console.warn('[config] JWT_SECRET is not set');
}

export default config;
