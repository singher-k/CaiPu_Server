#!/bin/bash
# 正确的重启服务脚本
cd /root/CaiPu_Server

echo "停止所有 node 进程..."
pkill -f "node.*app.js" 2>/dev/null || true
sleep 3

echo "确认进程已停止..."
ps aux | grep '[n]ode'

echo "启动服务..."
nohup node app.js > logs/app.log 2>&1 &
sleep 3

echo "检查服务状态..."
ps aux | grep '[n]ode'

echo "测试健康检查..."
curl -s http://localhost:3000/health

echo "查看最新日志..."
tail -20 logs/app.log
