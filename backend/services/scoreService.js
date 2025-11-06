/**
 * 评分维度：
 * 1. 标题质量（长度、关键词）
 * 2. 内容长度（适中最好）
 * 3. 来源权威性
 * 4. 时效性（发布时间）
 * 5. 关键词密度（技术相关）
 */

const KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
  'tech', 'technology', 'startup', 'product', 'innovation',
  'code', 'programming', 'developer', 'software', 'engineering',
  'design', 'ux', 'ui', 'user experience'
];

/**
 * 计算标题质量分数（0-20分）
 */
function scoreTitle(title) {
  if (!title) return 0;
  
  let score = 10; // 基础分
  
  // 长度评分（30-60字符最佳）
  const length = title.length;
  if (length >= 30 && length <= 60) {
    score += 5;
  } else if (length >= 20 && length <= 80) {
    score += 2;
  }
  
  // 关键词匹配
  const lowerTitle = title.toLowerCase();
  const matchedKeywords = KEYWORDS.filter(kw => lowerTitle.includes(kw));
  score += Math.min(matchedKeywords.length * 2, 5);
  
  return Math.min(score, 20);
}

/**
 * 计算内容长度分数（0-20分）
 */
function scoreContentLength(content) {
  if (!content) return 0;
  
  const length = content.length;
  
  // 200-1000字符最佳
  if (length >= 200 && length <= 1000) {
    return 20;
  } else if (length >= 100 && length <= 2000) {
    return 15;
  } else if (length >= 50 && length <= 3000) {
    return 10;
  } else if (length > 0) {
    return 5;
  }
  
  return 0;
}

/**
 * 计算来源权威性分数（0-20分）
 */
function scoreSource(source) {
  const sourceScores = {
    'Hacker News': 20,
    'Product Hunt': 18,
    'TechCrunch': 17,
    'The Verge': 16,
    '36氪': 15,
    '少数派': 15,
    'Medium': 12,
    'default': 10
  };
  
  return sourceScores[source] || sourceScores.default;
}

/**
 * 计算时效性分数（0-20分）
 */
function scoreTimeliness(publishedAt) {
  if (!publishedAt) return 10;
  
  const now = new Date();
  const published = new Date(publishedAt);
  const hoursDiff = (now - published) / (1000 * 60 * 60);
  
  // 24小时内：20分
  if (hoursDiff <= 24) return 20;
  // 3天内：15分
  if (hoursDiff <= 72) return 15;
  // 7天内：10分
  if (hoursDiff <= 168) return 10;
  // 30天内：5分
  if (hoursDiff <= 720) return 5;
  
  return 2;
}

/**
 * 计算关键词密度分数（0-20分）
 */
function scoreKeywordDensity(content) {
  if (!content) return 0;
  
  const lowerContent = content.toLowerCase();
  const matchedKeywords = KEYWORDS.filter(kw => lowerContent.includes(kw));
  
  // 匹配到3个以上关键词：20分
  if (matchedKeywords.length >= 3) return 20;
  // 匹配到2个：15分
  if (matchedKeywords.length >= 2) return 15;
  // 匹配到1个：10分
  if (matchedKeywords.length >= 1) return 10;
  
  return 5;
}

/**
 * 计算文章综合评分（0-100分）
 * @returns {Object} { score: number, details: Object }
 */
export function calculateScore(article) {
  const titleScore = scoreTitle(article.title);
  const contentScore = scoreContentLength(article.content);
  const sourceScore = scoreSource(article.source);
  const timelinessScore = scoreTimeliness(article.published_at);
  const keywordScore = scoreKeywordDensity(article.content);
  
  const totalScore = titleScore + contentScore + sourceScore + timelinessScore + keywordScore;
  
  return {
    score: Math.round(totalScore),
    details: {
      title: titleScore,
      contentLength: contentScore,
      source: sourceScore,
      timeliness: timelinessScore,
      keywords: keywordScore
    }
  };
}

