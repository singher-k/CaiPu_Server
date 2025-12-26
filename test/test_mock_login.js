const http = require('http');

console.log('🧪 模拟登录测试');

// 准备请求数据
const postData = JSON.stringify({
  code: 'mock_test_12345',  // 包含mock关键词
  nickName: '测试用户',
  avatarUrl: 'https://example.com/avatar.jpg'
});

// 请求选项
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 发送模拟登录请求...');

// 发送请求
const req = http.request(options, (res) => {
  console.log(`🔍 响应状态: ${res.statusCode}`);
  console.log('📋 响应头:', res.headers);

  let body = '';
  res.on('data', (chunk) => { body += chunk; });

  res.on('end', () => {
    console.log('📄 响应内容:', body);

    try {
      const response = JSON.parse(body);
      console.log('\n=== 响应分析 ===');
      console.log('✅ 成功:', response.success);
      console.log('💾 数据库连接:', response.dbConnected);
      
      if (response.dbStatus) {
        console.log('📊 数据库状态:');
        console.log('  - 连接状态:', response.dbStatus.connected);
        console.log('  - 错误类型:', response.dbStatus.errorType);
        console.log('  - 错误信息:', response.dbStatus.errorMessage);
      }
      
      if (response.user) {
        console.log('👤 用户信息:');
        console.log('  - ID:', response.user.id);
        console.log('  - OpenID:', response.user.openid);
        console.log('  - 昵称:', response.user.nickName);
      }

      if (response.sessionKey) {
        console.log('🔑 Session Key:', response.sessionKey);
      }

      console.log('\n=== 测试结果 ===');
      if (res.statusCode === 503 && !response.dbConnected) {
        console.log('✅ 模拟功能正常工作 - 数据库错误处理正确');
      } else {
        console.log('❌ 模拟功能可能有问题');
      }

    } catch (e) {
      console.log('❌ JSON解析失败:', e.message);
      console.log('原始内容:', body);
    }
  });
});

// 处理请求错误
req.on('error', (error) => {
  console.log('❌ 请求错误:', error.message);
});

// 发送数据
req.write(postData);
req.end();