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
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'rss'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    type: 'rss'
  },
  {
    name: '36氪',
    url: 'https://www.36kr.com/feed',
    type: 'rss'
  },
  {
    name: '少数派',
    url: 'https://sspai.com/feed',
    type: 'rss'
  }
];

/**
 * 清洗HTML内容为纯文本
 */
function cleanHtml(html) {
  if (!html) return '';
  const root = parse(html);
  let text = root.text.trim();
  
  // 过滤常见的无意义文本模式
  const meaninglessPatterns = [
    /^Discussion\s*\|\s*Link$/i,
    /^View\s+Discussion$/i,
    /^Read\s+more$/i,
    /^Continue\s+reading$/i,
    /^Click\s+here$/i,
    /^Link$/i,
    /^Discussion$/i,
    /^\s*[|]\s*$/,
    /^\s*-\s*$/,
  ];
  
  // 如果匹配到无意义模式，返回空字符串
  for (const pattern of meaninglessPatterns) {
    if (pattern.test(text)) {
      return '';
    }
  }
  
  return text;
}

/**
 * 从RSS源获取文章
 */
export async function fetchArticlesFromRSS() {
  const allArticles = [];

  for (const source of RSS_SOURCES) {
    try {
      console.log(`正在获取 ${source.name} RSS...`);
      const feed = await parser.parseURL(source.url);
      console.log(`${source.name} 获取成功，共 ${feed.items?.length || 0} 条`);
      
      for (const item of feed.items.slice(0, 20)) { // 限制每个源20条
        // 优先使用 content，然后是 contentSnippet，最后是 summary
        let content = '';
        if (item.content) {
          content = cleanHtml(item.content);
        } else if (item.contentSnippet) {
          content = cleanHtml(item.contentSnippet);
        } else if (item.summary) {
          content = cleanHtml(item.summary);
        }
        
        // 如果内容太短，尝试从 description 获取
        if (content.length < 100 && item.description) {
          const descContent = cleanHtml(item.description);
          // 只有当清洗后的内容有意义时才使用（长度大于10且不是无意义文本）
          if (descContent.length > 10 && descContent.length > content.length) {
            content = descContent;
          }
        }
        
        // 如果清洗后内容仍然为空或太短，设置为空字符串
        // 前端会显示"暂无内容预览"
        if (content.length < 10) {
          content = '';
        }
        
        const article = {
          title: item.title || '',
          content: content,
          link: item.link || '',
          source: source.name,
          published_at: item.pubDate || new Date().toISOString()
        };
        
        allArticles.push(article);
      }
      console.log(`${source.name} 处理完成，提取 ${feed.items.slice(0, 20).length} 条文章`);
    } catch (error) {
      console.error(`❌ Error fetching ${source.name}:`, error.message);
      console.error(`   URL: ${source.url}`);
    }
  }

  console.log(`✅ RSS 同步完成，共获取 ${allArticles.length} 条文章`);
  return allArticles;
}

