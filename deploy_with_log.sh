#!/bin/bash
# 一键更新服务器脚本 - 带有详细日志

echo "🔧 开始更新服务器..."
echo ""

cd /root/CaiPu_Server

echo "📋 当前状态:"
git status
echo ""

echo "📥 拉取最新代码..."
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo "⚠️ Git拉取失败，尝试强制更新..."
    git checkout -- package-lock.json
    git reset --hard origin/main
    git pull origin main
fi

echo ""
echo "📦 安装依赖..."
npm install --production

echo ""
echo "🔄 重启服务..."

# 停止现有服务
pkill -f "node.*app.js" || true
sleep 3

# 启动新服务
nohup node app.js > logs/app.log 2>&1 &
sleep 2

# 检查服务是否启动成功
if ps aux | grep "[n]ode.*app.js" > /dev/null; then
    echo "✅ 服务已成功启动"
    echo "📊 查看日志: tail -f logs/app.log"
else
    echo "❌ 服务启动失败，请检查日志"
    cat logs/app.log
fi
