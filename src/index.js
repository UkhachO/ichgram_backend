import 'dotenv/config';
import connectDatabase from './db/connectDatabase.js';
import startServer from './server.js';
import startWsServer from './wsServer.js';

const bootstrap = async () => {
  await connectDatabase();
  startServer();
  startWsServer();
};

bootstrap();
