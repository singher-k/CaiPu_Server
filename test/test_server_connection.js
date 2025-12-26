const http = require('http');

function testConnection() {
  console.log('🔍 测试服务器连接...\n');

  // 测试健康检查
  const healthOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  console.log('📊 测试健康检查端点...');
  const healthReq = http.request(healthOptions, (res) => {
    console.log(`✅ 健康检查响应状态: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('📄 健康检查响应:', body);

      // 然后测试登录端点
      console.log('\n🔍 测试登录端点...');
      testLogin();
    });
  });

  healthReq.on('error', (error) => {
    console.log('❌ 健康检查请求失败:', error.message);
  });

  healthReq.end();
}

function testLogin() {
  const data = JSON.stringify({
    code: 'test_code_12345',
    nickName: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('📤 发送登录请求到:', loginOptions.path);
  console.log('📊 请求数据:', data);

  const loginReq = http.request(loginOptions, (res) => {
    console.log(`📥 登录响应状态: ${res.statusCode}`);
    console.log('📋 响应头:', res.headers);

    let body = '';
    res.on('data', (chunk) => { body += chunk; });

    res.on('end', () => {
      console.log('📄 登录响应内容:', body);

      try {
        const response = JSON.parse(body);
        if (response.error) {
          console.log('❌ 登录错误:', response.error);
          if (response.details) {
            console.log('🔍 详细信息:', response.details);
          }
        } else if (response.success) {
          console.log('✅ 登录成功!');
          console.log('👤 用户信息:', response.user);
        } else {
          console.log('❓ 未知响应格式');
        }
      } catch (e) {
        console.log('❌ JSON解析失败:', e.message);
        console.log('原始内容:', body);
      }
    });
  });

  loginReq.on('error', (error) => {
    console.log('❌ 登录请求失败:', error.message);
  });

  loginReq.write(data);
  loginReq.end();
}

testConnection();