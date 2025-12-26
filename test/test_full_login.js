const http = require('http');

// 模拟真实的登录请求
function testLogin() {
  console.log('=== 完整登录流程测试 ===\n');
  
  const loginData = JSON.stringify({
    code: 'mock_test_123456',
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
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log('🔧 发送完整登录请求...');
  console.log('📋 请求数据:', loginData);

  const req = http.request(options, (res) => {
    console.log('\n📡 响应状态:', res.statusCode);
    console.log('📋 响应头:', JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📄 响应内容:', data);
      
      try {
        const response = JSON.parse(data);
        console.log('\n=== 响应分析 ===');
        console.log('✅ 成功:', response.success);
        
        if (response.user) {
          console.log('👤 用户ID:', response.user.id);
          console.log('🔑 OpenID:', response.user.openid);
          console.log('📝 昵称:', response.user.nickName);
          console.log('🖼️ 头像:', response.user.avatarUrl);
        }
        
        if (response.sessionKey) {
          console.log('🔐 Session Key:', response.sessionKey);
        }
        
        if (response.dbStatus) {
          console.log('🗄️ 数据库状态:', JSON.stringify(response.dbStatus, null, 2));
        }

        console.log('\n=== 测试结果 ===');
        if (response.success && response.user && response.sessionKey) {
          console.log('✅ 登录API完全正常工作');
          if (!response.dbConnected) {
            console.log('⚠️ 数据库连接有问题，但API仍然能够正确处理');
          } else {
            console.log('✅ 数据库连接正常');
          }
        } else {
          console.log('❌ 登录API有问题');
        }
      } catch (error) {
        console.log('\n❌ 响应解析失败:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('\n❌ 请求错误:', error.message);
  });

  req.write(loginData);
  req.end();
}

// 运行测试
testLogin();