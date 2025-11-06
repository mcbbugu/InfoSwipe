#!/bin/bash

# InfoSwipe 一键启动脚本

echo "🚀 启动 InfoSwipe..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 创建数据目录
mkdir -p backend/data

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# 注册清理函数
trap cleanup INT TERM

# 启动后端
echo "📦 启动后端服务..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "等待后端启动..."
sleep 3

# 检查后端是否启动成功
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ 后端启动失败，请查看 backend.log"
    exit 1
fi

# 启动前端
echo "🎨 启动前端服务..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端启动
sleep 2

# 检查前端是否启动成功
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ 前端启动失败，请查看 frontend.log"
    cleanup
    exit 1
fi

echo ""
echo "✅ 服务已启动！"
echo "📱 前端: http://localhost:3000"
echo "🔧 后端: http://localhost:3001"
echo ""
echo "日志文件:"
echo "  - backend.log"
echo "  - frontend.log"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait

