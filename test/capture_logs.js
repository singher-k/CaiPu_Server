const http = require('http');
const { spawn } = require('child_process');

// 启动服务器
const serverProcess = spawn('node', ['app.js'], {
  cwd: process.cwd(),
  env: process.env
});

// 捕获服务器输出
serverProcess.stdout.on('data', (data) => {
  console.log(`服务器输出: ${data}`);
});

// 捕获服务器错误
serverProcess.stderr.on('data', (data) => {
  console.error(`服务器错误: ${data}`);
});

// 等待服务器启动
setTimeout(() => {
  console.log('发送测试请求...');
  
  // 测试登录接口
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log(`响应: ${body}`);
      
      // 关闭服务器
      serverProcess.kill();
      process.exit(0);
    });
  });
  
  req.on('error', (error) => {
    console.error(`请求错误: ${error.message}`);
    serverProcess.kill();
    process.exit(1);
  });
  
  req.write(JSON.stringify({
    code: 'mock_success',
    nickName: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg'
  }));
  
  req.end();
}, 3000); // 等待3秒让服务器完全启动