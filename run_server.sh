#!/bin/bash
# 在服务器上执行启动脚本
cd /root/CaiPu_Server
pkill -f "node.*app.js" 2>/dev/null
sleep 2
nohup node app.js > /tmp/node.log 2>&1 &
sleep 3
ps aux | grep "[n]ode"
curl -s http://localhost:3000/health
