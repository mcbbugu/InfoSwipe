import { compareTwoStrings } from 'string-similarity';
import crypto from 'crypto';

/**
 * 生成文章的唯一哈希（用于快速去重）
 */
export function generateHash(title, content) {
  const text = `${title}${content}`.toLowerCase().trim();
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * 计算文本相似度（0-1之间）
 */
function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  return compareTwoStrings(text1.toLowerCase(), text2.toLowerCase());
}

/**
 * 检查文章是否重复
 * @param {Object} article - 新文章
 * @param {Array} existingArticles - 已存在的文章列表
 * @returns {Object} { isDuplicate: boolean, reason: string, similarArticle: Object|null }
 */
export function checkDuplicate(article, existingArticles) {
  const hash = generateHash(article.title, article.content);
  
  // 1. 先检查哈希是否完全一致
  const exactMatch = existingArticles.find(a => a.dedupe_hash === hash);
  if (exactMatch) {
    return {
      isDuplicate: true,
      reason: '完全相同的标题和内容',
      similarArticle: exactMatch
    };
  }

  // 2. 检查标题相似度
  const titleThreshold = 0.85; // 85%相似度阈值
  for (const existing of existingArticles) {
    const titleSimilarity = calculateSimilarity(article.title, existing.title);
    
    if (titleSimilarity >= titleThreshold) {
      // 如果标题相似，再检查内容相似度
      const contentSimilarity = calculateSimilarity(
        article.content.substring(0, 500), // 只比较前500字符
        existing.content?.substring(0, 500) || ''
      );
      
      if (contentSimilarity >= 0.7) {
        return {
          isDuplicate: true,
          reason: `标题相似度${(titleSimilarity * 100).toFixed(1)}%，内容相似度${(contentSimilarity * 100).toFixed(1)}%`,
          similarArticle: existing
        };
      }
    }
  }

  return {
    isDuplicate: false,
    reason: null,
    similarArticle: null
  };
}

