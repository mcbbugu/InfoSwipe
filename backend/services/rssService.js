import Parser from 'rss-parser';
import { parse } from 'node-html-parser';

const parser = new Parser();

// RSS源配置
const RSS_SOURCES = [
  {
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    type: 'rss'
  },
  {
    name: 'Product Hunt',
    url: 'https://www.producthunt.com/feed',
    type: 'rss'
  }
];

/**
 * 清洗HTML内容为纯文本
 */
function cleanHtml(html) {
  if (!html) return '';
  const root = parse(html);
  return root.text.trim();
}

/**
 * 从RSS源获取文章
 */
export async function fetchArticlesFromRSS() {
  const allArticles = [];

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      
      for (const item of feed.items.slice(0, 20)) { // 限制每个源20条
        const article = {
          title: item.title || '',
          content: cleanHtml(item.contentSnippet || item.content || item.summary || ''),
          link: item.link || '',
          source: source.name,
          published_at: item.pubDate || new Date().toISOString()
        };
        
        allArticles.push(article);
      }
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error.message);
    }
  }

  return allArticles;
}

