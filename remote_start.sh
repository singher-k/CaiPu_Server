#!/bin/bash
# 在服务器上执行的启动脚本
# 这个文件需要上传到服务器后执行

cd /root/CaiPu_Server

# 停止现有服务
pkill -f "node.*app.js" 2>/dev/null || true
sleep 2

# 启动新服务（使用tee）
nohup node app.js > >(tee logs/app.log) 2>&1 &
sleep 3

# 检查状态
if ps aux | grep "[n]ode.*app.js" > /dev/null; then
    echo "✅ 服务已启动"
    curl -s http://localhost:3000/health
else
    echo "❌ 服务启动失败"
fi
