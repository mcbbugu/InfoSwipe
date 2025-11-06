# InfoSwipe MVP

一个通过"滑动分拣"快速管理资讯的 MVP 应用，将内容分为"行动/观察/归档"三类，提升决策效率。

## 功能特性

- ✅ 接入 6 个 RSS 资讯源（Hacker News、Product Hunt、TechCrunch、The Verge、36氪、少数派）
- ✅ 三向滑动交互（上滑=行动，右滑=观察，左滑=归档）
- ✅ 持久化存储分拣结果（SQLite）
- ✅ 可解释的去重方法（标题/文本相似度）
- ✅ 自定义 5 个评分维度（标题质量、内容长度、来源权威性、时效性、关键词密度）
- ✅ 回顾视图：展示处理量、各池内容、最近操作等

## 技术栈

### 后端
- **框架**: Fastify
- **数据库**: SQLite (better-sqlite3)
- **RSS解析**: rss-parser
- **去重算法**: string-similarity
- **HTML清洗**: node-html-parser

### 前端
- **框架**: Vue 3
- **构建工具**: Vite
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios

## 快速开始

### 方式一：使用一键启动脚本（推荐）

```bash
./start.sh
```

### 方式二：手动启动

#### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

#### 2. 启动服务

```bash
# 终端1：启动后端（端口 3001）
cd backend
npm start

# 终端2：启动前端（端口 3000）
cd frontend
npm run dev
```

#### 3. 访问应用

打开浏览器访问：http://localhost:3000

## 项目结构

```
infoswipe/
├── backend/                 # 后端服务
│   ├── db/                  # 数据库配置
│   │   └── database.js      # SQLite 初始化
│   ├── routes/              # API 路由
│   │   ├── index.js         # 路由注册
│   │   ├── articles.js      # 文章相关 API
│   │   └── stats.js         # 统计数据 API
│   ├── services/            # 业务逻辑服务
│   │   ├── rssService.js    # RSS 获取与清洗
│   │   ├── dedupeService.js # 去重服务
│   │   └── scoreService.js  # 评分服务
│   ├── data/                # 数据库文件目录
│   └── index.js             # 入口文件
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   │   └── ArticleCard.vue
│   │   ├── views/           # 页面视图
│   │   │   ├── SwipeView.vue    # 分拣视图
│   │   │   └── ReviewView.vue   # 回顾视图
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 入口文件
│   └── vite.config.js       # Vite 配置
├── start.sh                 # 一键启动脚本
├── README.md                # 项目说明
├── ADR.md                   # 架构决策记录
└── DEVLOG.md                # 开发日志
```

## API 文档

### 文章相关

- `GET /api/articles` - 获取文章列表
  - Query: `category` (pending/action/observe/archive)
  
- `POST /api/articles/sync` - 同步 RSS 源

- `GET /api/articles/:id` - 获取单篇文章

- `PUT /api/articles/:id/category` - 更新文章分类
  - Body: `{ category: 'action'|'observe'|'archive', action: string }`

### 统计数据

- `GET /api/stats` - 获取统计数据
  - 返回：分类统计、总处理量、最近操作、各分类文章列表

## 评分维度说明

1. **标题质量** (0-20分)：长度适中（30-60字符最佳）、关键词匹配
2. **内容长度** (0-20分)：200-1000字符最佳
3. **来源权威性** (0-20分)：Hacker News=20分，Product Hunt=18分
4. **时效性** (0-20分)：24小时内=20分，随时间递减
5. **关键词密度** (0-20分)：匹配技术相关关键词数量

总分：0-100分

## 去重算法

1. **哈希去重**：基于标题+内容的 MD5 哈希
2. **相似度去重**：
   - 标题相似度 ≥ 85%
   - 且内容相似度 ≥ 70%
   - 使用 Dice 系数算法

## 开发说明

- 数据库文件位置：`backend/data/infoswipe.db`
- 后端日志：Fastify 内置 logger
- 前端热更新：Vite HMR

## 注意事项

- 首次运行会自动创建数据库和数据目录
- RSS 同步会限制每个源最多 20 条文章
- 滑动操作需要移动距离超过 100px 才会触发分类

## 许可证

ISC

