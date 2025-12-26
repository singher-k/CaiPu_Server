const http = require('http');

function testLogin() {
  console.log('🔍 直接测试登录接口...\n');

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

  req.on('error', (error) => {
    console.log('❌ 请求失败:', error.message);
  });

  req.write(data);
  req.end();
}

testLogin();