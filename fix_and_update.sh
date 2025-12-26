#!/bin/bash
# 修复Git冲突并更新脚本

set -e

echo "🔧 修复Git冲突并更新服务器..."
echo ""

# 进入项目目录
cd /root/CaiPu_Server

# 1. 放弃本地对package-lock.json的更改
echo "📦 放弃本地package-lock.json更改..."
git checkout -- package-lock.json

# 2. 停止服务
echo "🛑 停止服务..."
pkill -f "node.*app.js" || echo "ℹ️ 服务已停止或未运行"
sleep 2

# 3. 拉取最新代码
echo "📥 拉取最新代码..."
git fetch origin
git pull origin main

# 4. 安装依赖
echo "📦 安装依赖..."
npm install --production

# 5. 启动服务
echo "🚀 启动服务..."
nohup node app.js > logs/app.log 2>&1 &
SERVICE_PID=$!
echo "✅ 服务已启动 (PID: $SERVICE_PID)"

# 6. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 7. 验证服务状态
echo "🔍 验证服务状态..."
curl -s http://localhost:3000/health

echo ""
echo "✅ 更新完成！"
echo "📡 测试用户更新接口："
curl -X POST http://localhost:3000/api/user/update \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "nickName": "测试用户", "avatarUrl": "https://example.com/avatar.jpg"}'
