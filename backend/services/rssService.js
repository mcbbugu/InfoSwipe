import Parser from 'rss-parser';
import { parse } from 'node-html-parser';

// 配置自定义字段映射，支持更多 RSS 格式
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
      ['content', 'content'],
      ['summary', 'summary'],
    ]
  }
});

// RSS源配置（中文源优先）
const RSS_SOURCES = [
  // 中文科技媒体（优先）
  {
    name: '36氪',
    url: 'https://www.36kr.com/feed',
    type: 'rss'
  },
  {
    name: '少数派',
    url: 'https://sspai.com/rss',
    type: 'rss'
  },
  {
    name: '虎嗅',
    url: 'https://www.huxiu.com/rss/0.xml',
    type: 'rss'
  },
  {
    name: '极客公园',
    url: 'https://www.geekpark.net/rss',
    type: 'rss'
  },
  {
    name: '爱范儿',
    url: 'https://www.ifanr.com/feed',
    type: 'rss'
  },
  {
    name: '钛媒体',
    url: 'https://www.tmtpost.com/rss.xml',
    type: 'rss'
  },
  {
    name: '品玩',
    url: 'https://www.pingwest.com/feed',
    type: 'rss'
  },
  {
    name: '界面新闻',
    url: 'https://www.jiemian.com/rss/tech.xml',
    type: 'rss'
  },
  {
    name: '掘金',
    url: 'https://juejin.cn/rss',
    type: 'rss'
  },
  {
    name: 'V2EX',
    url: 'https://www.v2ex.com/index.xml',
    type: 'rss'
  },
  // 英文科技媒体
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
  // {
  //   name: 'Hacker News',
  //   url: 'https://hnrss.org/frontpage',
  //   type: 'rss'
  // },
  // {
  //   name: 'Product Hunt',
  //   url: 'https://www.producthunt.com/feed',
  //   type: 'rss'
  // }
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
      
      let contentCount = 0;
      let emptyCount = 0;
      
      for (const item of feed.items.slice(0, 30)) { // 限制每个源30条
        // 按优先级尝试提取内容：content:encoded > content > contentSnippet > summary > description
        let content = '';
        
        // 1. 尝试 content:encoded（很多 RSS 源使用这个字段存储完整内容）
        if (item.contentEncoded) {
          content = cleanHtml(item.contentEncoded);
        }
        // 2. 尝试 content
        else if (item.content) {
          content = cleanHtml(item.content);
        }
        // 3. 尝试 contentSnippet
        else if (item.contentSnippet) {
          content = cleanHtml(item.contentSnippet);
        }
        // 4. 尝试 summary
        else if (item.summary) {
          content = cleanHtml(item.summary);
        }
        // 5. 最后尝试 description（通常包含摘要）
        else if (item.description) {
          const descContent = cleanHtml(item.description);
          // 只有当清洗后的内容有意义时才使用（长度大于50字符，避免只是链接）
          if (descContent.length > 50) {
            content = descContent;
          }
        }
        
        // 过滤掉 URL 和链接文本
        if (content) {
          // 如果内容看起来像 URL，过滤掉
          const urlPattern = /^https?:\/\/.+/i;
          if (urlPattern.test(content.trim())) {
            content = '';
          }
          // 如果内容太短（可能是链接文本），过滤掉
          if (content.length < 50) {
            content = '';
          }
        }
        
        // 统计
        if (content && content.length >= 50) {
          contentCount++;
        } else {
          emptyCount++;
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
      console.log(`${source.name} 处理完成：共 ${feed.items.slice(0, 30).length} 条，有内容 ${contentCount} 条，无内容 ${emptyCount} 条`);
    } catch (error) {
      console.error(`❌ Error fetching ${source.name}:`, error.message);
      console.error(`   URL: ${source.url}`);
    }
  }

  console.log(`✅ RSS 同步完成，共获取 ${allArticles.length} 条文章`);
  return allArticles;
}

