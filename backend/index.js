import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initDatabase } from './db/database.js';
import { registerRoutes } from './routes/index.js';

const fastify = Fastify({
  logger: true
});

// 注册CORS
await fastify.register(cors, {
  origin: true
});

// 初始化数据库
initDatabase();

// 注册路由
await registerRoutes(fastify);

// 启动服务器
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

