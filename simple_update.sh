#!/bin/bash
# 简单的一键更新脚本 - 跳过备份，直接更新

echo "🔧 开始更新服务器..."
echo ""

cd /root/CaiPu_Server

# 1. 放弃本地更改并拉取
echo "📥 放弃冲突文件并拉取最新代码..."
git checkout -- package-lock.json
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git拉取失败，尝试强制更新..."
    git reset --hard origin/main
    git pull origin main
fi

# 2. 安装依赖
echo "📦 安装依赖..."
npm install --production

# 3. 重启服务
echo "🔄 重启服务..."
pkill -f "node.*app.js" || true
sleep 3
nohup node app.js > logs/app.log 2>&1 &
echo "✅ 服务已启动"

# 4. 等待并验证
sleep 5

echo ""
echo "🔍 验证服务状态..."
curl -s http://localhost:3000/health
echo ""

echo ""
echo "✅ 更新完成！"
