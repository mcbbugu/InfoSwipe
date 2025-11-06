# SQLite 数据库查看指南

## 方式一：使用查看脚本（推荐）

运行项目后，使用提供的脚本快速查看：

```bash
./view-db.sh
```

这会显示：
- 表结构
- 各分类文章统计
- 最近10篇文章
- 最近10条操作记录

## 方式二：使用 sqlite3 命令行工具

### 进入交互式命令行

```bash
sqlite3 backend/data/infoswipe.db
```

### 常用命令

```sql
-- 查看所有表
.tables

-- 查看表结构
.schema articles
.schema operations

-- 查看所有文章
SELECT * FROM articles;

-- 查看待处理文章
SELECT * FROM articles WHERE category = 'pending';

-- 查看各分类统计
SELECT category, COUNT(*) FROM articles GROUP BY category;

-- 查看评分最高的10篇文章
SELECT title, source, score FROM articles ORDER BY score DESC LIMIT 10;

-- 查看评分详情（需要解析 JSON）
SELECT id, title, score, score_details FROM articles LIMIT 5;

-- 查看操作历史
SELECT * FROM operations ORDER BY created_at DESC LIMIT 20;

-- 退出
.quit
```

### 直接执行 SQL 查询

```bash
# 查看所有文章
sqlite3 backend/data/infoswipe.db "SELECT * FROM articles;"

# 查看统计信息
sqlite3 backend/data/infoswipe.db "SELECT category, COUNT(*) as count FROM articles GROUP BY category;"

# 格式化输出（带表头）
sqlite3 -header -column backend/data/infoswipe.db "SELECT * FROM articles LIMIT 10;"
```

## 方式三：使用图形化工具

### DB Browser for SQLite（推荐）

1. 下载安装：https://sqlitebrowser.org/
2. 打开数据库文件：`backend/data/infoswipe.db`
3. 可视化查看和编辑数据

### VS Code 扩展

安装 "SQLite Viewer" 或 "SQLite" 扩展，直接在 VS Code 中查看数据库。

## 数据库文件位置

```
backend/data/infoswipe.db
```

**注意**：如果数据库文件不存在，请先运行项目（`./start.sh`），数据库会自动创建。

## 快速查询示例

```bash
# 查看总文章数
sqlite3 backend/data/infoswipe.db "SELECT COUNT(*) FROM articles;"

# 查看各分类数量
sqlite3 backend/data/infoswipe.db "SELECT category, COUNT(*) FROM articles GROUP BY category;"

# 查看评分最高的5篇文章
sqlite3 -header -column backend/data/infoswipe.db "SELECT title, source, score FROM articles ORDER BY score DESC LIMIT 5;"

# 查看今天的操作记录
sqlite3 -header -column backend/data/infoswipe.db "SELECT * FROM operations WHERE date(created_at) = date('now');"
```

