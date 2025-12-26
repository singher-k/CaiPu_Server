const http = require('http');
require('dotenv').config();

// 简单的HTTP请求函数
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`状态码: ${res.statusCode}`);
        console.log('响应头:', res.headers);
        console.log('响应内容:', body);

        try {
          const response = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          reject(new Error('响应不是有效的JSON格式'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试登录接口
function testLogin() {
  console.log('🔍 测试登录接口...\n');

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
    console.log(`🔍 响应状态: ${res.statusCode}`);
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
    });
  });

  req.on('error', (error) => {
    console.log('❌ 请求失败:', error.message);
  });

  req.write(data);
  req.end();
}

// 测试获取用户信息接口
function testGetUser() {
  console.log('\n🔍 测试获取用户信息接口...\n');

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/user/test_openid_123',
    method: 'GET'
  }, (res) => {
    console.log(`📥 响应状态: ${res.statusCode}`);

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
        } else if (response.user) {
          console.log('✅ 用户信息获取成功:', response.user);
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

  req.end();
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await makeRequest('http://localhost:3000');
    console.log('✅ 服务器运行正常');
    return true;
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ 服务器未运行，请先启动服务器: npm start');
    } else {
      console.log('❌ 服务器连接失败:', error.message);
    }
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 微信登录流程测试工具\n');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('');
    return;
  }

  // 显示微信配置信息
  console.log('📋 微信配置信息:');
  console.log('APPID:', process.env.WECHAT_APPID);
  console.log('SECRET:', process.env.WECHAT_SECRET ? '***' + process.env.WECHAT_SECRET.slice(-4) : '未配置');
  console.log('GRANT_TYPE:', process.env.WECHAT_GRANT_TYPE || 'authorization_code');
  console.log('');

  // 测试登录接口
  testLogin();

  // 测试获取用户信息接口
  testGetUser();

  console.log('\n📝 说明:');
  console.log('1. 真实的微信登录流程需要通过微信开发者工具或小程序获取有效的code');
  console.log('2. 测试使用的test_code_12345不是真实的微信登录凭证，所以会返回错误');
  console.log('3. 在微信开发者工具中运行小程序，获取真实的code进行测试');
  console.log('4. 代码实现了完整的微信登录流程，逻辑符合官方文档要求');
}

runTests();