import { articleRoutes } from './articles.js';
import { statsRoutes } from './stats.js';

export async function registerRoutes(fastify) {
  await fastify.register(articleRoutes, { prefix: '/api/articles' });
  await fastify.register(statsRoutes, { prefix: '/api/stats' });
}

