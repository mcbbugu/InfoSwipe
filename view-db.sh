#!/bin/bash

# InfoSwipe 数据库查看工具

DB_PATH="backend/data/infoswipe.db"

if [ ! -f "$DB_PATH" ]; then
    echo "❌ 数据库文件不存在: $DB_PATH"
    echo "💡 请先运行项目，数据库会自动创建"
    exit 1
fi

echo "📊 InfoSwipe 数据库查看工具"
echo "================================"
echo ""

# 显示表结构
echo "📋 表结构："
echo "---"
sqlite3 "$DB_PATH" ".schema"

echo ""
echo "📈 数据统计："
echo "---"

# 统计各分类文章数量
echo "文章分类统计："
sqlite3 "$DB_PATH" "SELECT category, COUNT(*) as count FROM articles GROUP BY category;"

echo ""
echo "总文章数："
sqlite3 "$DB_PATH" "SELECT COUNT(*) as total FROM articles;"

echo ""
echo "最近10篇文章："
sqlite3 -header -column "$DB_PATH" "SELECT id, title, source, category, score, created_at FROM articles ORDER BY created_at DESC LIMIT 10;"

echo ""
echo "最近10条操作记录："
sqlite3 -header -column "$DB_PATH" "SELECT o.id, a.title, o.action, o.created_at FROM operations o JOIN articles a ON o.article_id = a.id ORDER BY o.created_at DESC LIMIT 10;"

echo ""
echo "💡 提示："
echo "  直接运行 'sqlite3 $DB_PATH' 进入交互式命令行"
echo "  或运行 'sqlite3 $DB_PATH \"SELECT * FROM articles;\"' 执行 SQL 查询"

