#!/bin/bash
# 使用tee同时输出到文件和标准输出，解决日志问题

echo "🔧 停止现有服务..."
pkill -f "node.*app.js" || true
sleep 2

echo "🚀 启动服务（使用tee捕获日志）..."
cd /root/CaiPu_Server

# 使用tee同时写入日志文件和显示输出
nohup node app.js > >(tee logs/app.log) 2>&1 &
sleep 3

# 检查服务状态
if ps aux | grep "[n]ode.*app.js" > /dev/null; then
    echo "✅ 服务已启动"
    echo "📊 进程信息:"
    ps aux | grep "[n]ode.*app.js"
    echo ""
    echo "📝 测试健康检查:"
    curl -s http://localhost:3000/health
    echo ""
else
    echo "❌ 服务启动失败"
fi
