import { getDB } from '../db/database.js';

export async function statsRoutes(fastify) {
  // 获取统计数据
  fastify.get('/', async (request, reply) => {
    const db = getDB();
    
    // 各分类数量
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM articles 
      GROUP BY category
    `).all();
    
    // 总处理量
    const totalProcessed = db.prepare(`
      SELECT COUNT(*) as count 
      FROM articles 
      WHERE category != 'pending'
    `).get();
    
    // 最近操作（最近20条）
    const recentOperations = db.prepare(`
      SELECT o.*, a.title, a.category
      FROM operations o
      JOIN articles a ON o.article_id = a.id
      ORDER BY o.created_at DESC
      LIMIT 20
    `).all();
    
    // 各分类的文章列表（最近10条）
    const actionArticles = db.prepare(`
      SELECT id, title, source, score, created_at
      FROM articles
      WHERE category = 'action'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();
    
    const observeArticles = db.prepare(`
      SELECT id, title, source, score, created_at
      FROM articles
      WHERE category = 'observe'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();
    
    const archiveArticles = db.prepare(`
      SELECT id, title, source, score, created_at
      FROM articles
      WHERE category = 'archive'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();
    
    return {
      categoryStats: categoryStats.reduce((acc, item) => {
        acc[item.category] = item.count;
        return acc;
      }, {}),
      totalProcessed: totalProcessed.count,
      recentOperations,
      articlesByCategory: {
        action: actionArticles,
        observe: observeArticles,
        archive: archiveArticles
      }
    };
  });
}

