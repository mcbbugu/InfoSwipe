import { getDB } from '../db/database.js';
import { fetchArticlesFromRSS } from '../services/rssService.js';
import { checkDuplicate, generateHash } from '../services/dedupeService.js';
import { calculateScore } from '../services/scoreService.js';

export async function articleRoutes(fastify) {
  // 获取待处理文章列表
  fastify.get('/', async (request, reply) => {
    const db = getDB();
    const category = request.query.category || 'pending';
    
    const articles = db.prepare(`
      SELECT * FROM articles 
      WHERE category = ? 
      ORDER BY score DESC, created_at DESC 
      LIMIT 50
    `).all(category);
    
    // 解析评分详情
    articles.forEach(article => {
      if (article.score_details) {
        try {
          article.score_details = JSON.parse(article.score_details);
        } catch (e) {
          article.score_details = null;
        }
      }
    });
    
    return { articles };
  });

  // 同步RSS源
  fastify.post('/sync', async (request, reply) => {
    const db = getDB();
    const newArticles = await fetchArticlesFromRSS();
    
    // 获取现有文章用于去重
    const existingArticles = db.prepare('SELECT * FROM articles').all();
    
    let added = 0;
    let skipped = 0;
    const duplicates = [];
    
    for (const article of newArticles) {
      // 检查重复
      const duplicateCheck = checkDuplicate(article, existingArticles);
      
      if (duplicateCheck.isDuplicate) {
        skipped++;
        duplicates.push({
          title: article.title,
          reason: duplicateCheck.reason
        });
        continue;
      }
      
      // 计算评分
      const scoreResult = calculateScore(article);
      const hash = generateHash(article.title, article.content);
      
      // 插入数据库
      try {
        db.prepare(`
          INSERT INTO articles (title, content, link, source, published_at, score, score_details, dedupe_hash, category)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `).run(
          article.title,
          article.content,
          article.link,
          article.source,
          article.published_at,
          scoreResult.score,
          JSON.stringify(scoreResult.details),
          hash
        );
        
        added++;
        existingArticles.push({ ...article, dedupe_hash: hash });
      } catch (error) {
        // 可能是唯一约束冲突
        if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
          console.error('Error inserting article:', error);
        }
        skipped++;
      }
    }
    
    return {
      success: true,
      added,
      skipped,
      duplicates: duplicates.slice(0, 5) // 只返回前5个重复项
    };
  });

  // 更新文章分类（滑动操作）
  fastify.put('/:id/category', async (request, reply) => {
    const db = getDB();
    const { id } = request.params;
    const { category, action } = request.body;
    
    // 验证分类
    const validCategories = ['action', 'observe', 'archive'];
    if (!validCategories.includes(category)) {
      return reply.code(400).send({ error: 'Invalid category' });
    }
    
    // 更新分类
    const result = db.prepare('UPDATE articles SET category = ? WHERE id = ?').run(category, id);
    
    if (result.changes === 0) {
      return reply.code(404).send({ error: 'Article not found' });
    }
    
    // 记录操作历史
    db.prepare('INSERT INTO operations (article_id, action) VALUES (?, ?)').run(id, action || category);
    
    return { success: true };
  });

  // 获取单篇文章
  fastify.get('/:id', async (request, reply) => {
    const db = getDB();
    const { id } = request.params;
    
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    
    if (!article) {
      return reply.code(404).send({ error: 'Article not found' });
    }
    
    // 解析评分详情
    if (article.score_details) {
      article.score_details = JSON.parse(article.score_details);
    }
    
    return { article };
  });
}

