#!/bin/bash
# 启动服务脚本 - 包含密码输入

echo "🔧 停止现有服务..."
pkill -f "node.*app.js" 2>/dev/null || true
sleep 2

echo "🚀 启动服务（使用tee捕获日志）..."
cd /root/CaiPu_Server

# 使用expect自动输入密码并执行
expect << EOF
set timeout 30
spawn bash -c "nohup node app.js > >(tee logs/app.log) 2>&1 &"
expect "password:"
send "Singher1008\r"
expect eof
EOF

sleep 3

# 检查服务状态
if ps aux | grep "[n]ode.*app.js" > /dev/null; then
    echo "✅ 服务已启动"
    echo "📊 测试健康检查:"
    curl -s http://localhost:3000/health
    echo ""
else
    echo "❌ 服务启动失败"
fi
