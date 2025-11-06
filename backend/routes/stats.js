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
      SELECT o.*, a.title, a.category, a.link, a.source, a.score
      FROM operations o
      JOIN articles a ON o.article_id = a.id
      ORDER BY o.created_at DESC
      LIMIT 20
    `).all();
    
    // 各分类的文章列表（最近10条，包含完整信息）
    // 使用 LEFT JOIN operations 来获取最后操作时间，按操作时间排序（最新的在最上面）
    const actionArticles = db.prepare(`
      SELECT a.id, a.title, a.content, a.link, a.source, a.score, a.score_details, a.published_at, a.created_at,
             MAX(o.created_at) as last_action_time
      FROM articles a
      LEFT JOIN operations o ON a.id = o.article_id
      WHERE a.category = 'action'
      GROUP BY a.id
      ORDER BY COALESCE(MAX(o.created_at), a.created_at) DESC
      LIMIT 10
    `).all();
    
    const observeArticles = db.prepare(`
      SELECT a.id, a.title, a.content, a.link, a.source, a.score, a.score_details, a.published_at, a.created_at,
             MAX(o.created_at) as last_action_time
      FROM articles a
      LEFT JOIN operations o ON a.id = o.article_id
      WHERE a.category = 'observe'
      GROUP BY a.id
      ORDER BY COALESCE(MAX(o.created_at), a.created_at) DESC
      LIMIT 10
    `).all();
    
    const archiveArticles = db.prepare(`
      SELECT a.id, a.title, a.content, a.link, a.source, a.score, a.score_details, a.published_at, a.created_at,
             MAX(o.created_at) as last_action_time
      FROM articles a
      LEFT JOIN operations o ON a.id = o.article_id
      WHERE a.category = 'archive'
      GROUP BY a.id
      ORDER BY COALESCE(MAX(o.created_at), a.created_at) DESC
      LIMIT 10
    `).all();
    
    // 解析评分详情
    [actionArticles, observeArticles, archiveArticles].forEach(articles => {
      articles.forEach(article => {
        if (article.score_details) {
          try {
            article.score_details = JSON.parse(article.score_details);
          } catch (e) {
            article.score_details = null;
          }
        }
      });
    });
    
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

