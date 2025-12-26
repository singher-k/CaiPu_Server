const http = require('http');
const pool = require('./config/database');

// 创建一个简单的HTTP服务器来拦截微信API请求
const server = http.createServer((req, res) => {
  if (req.url.includes('sns/jscode2session')) {
    // 模拟微信API的成功响应
    const responseData = {
      openid: 'mock_openid_' + Date.now(),
      session_key: 'mock_session_key_' + Date.now()
    };
    
    console.log('模拟微信API响应:', responseData);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 启动模拟微信API服务器
server.listen(8080, () => {
  console.log('模拟微信API服务器启动在端口8080');
  
  // 测试登录接口
  testLogin();
});

function testLogin() {
  console.log('\n测试登录接口...\n');

  const data = JSON.stringify({
    code: 'test_code_12345',
    nickName: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('📤 发送请求到:', options.path);
  console.log('📊 请求数据:', data);

  const req = http.request(options, (res) => {
    console.log(`📥 响应状态: ${res.statusCode}`);
    console.log('📋 响应头:', res.headers);

    let body = '';
    res.on('data', (chunk) => { body += chunk; });

    res.on('end', () => {
      console.log('📄 响应内容:', body);

      try {
        const response = JSON.parse(body);
        if (response.error) {
          console.log('❌ 错误信息:', response.error);
          if (response.details) {
            console.log('🔍 详细信息:', response.details);
          }
          if (response.dbStatus && !response.dbStatus.connected) {
            console.log('💾 数据库状态:', response.dbStatus);
          }
        } else if (response.success) {
          console.log('✅ 登录成功!');
          console.log('👤 用户信息:', response.user);
          if (!response.dbConnected) {
            console.log('⚠️ 警告: 数据库不可用，使用的临时数据');
            if (response.dbStatus) {
              console.log('💾 数据库状态:', response.dbStatus);
            }
          }
        } else {
          console.log('❓ 未知响应格式');
        }
      } catch (e) {
        console.log('❌ JSON解析失败:', e.message);
        console.log('原始内容:', body);
      }
      
      // 关闭模拟服务器
      server.close(() => {
        console.log('\n模拟微信API服务器已关闭');
        process.exit(0);
      });
    });
  });

  req.on('error', (error) => {
    console.log('❌ 请求失败:', error.message);
    server.close();
  });

  req.write(data);
  req.end();
}