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
        try {
          const response = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
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

// 测试微信登录接口
async function testWechatLogin() {
  console.log('🧪 开始测试微信登录接口...\n');

  const baseUrl = 'http://localhost:3000';

  // 测试1: 验证配置是否正确
  console.log('📋 测试1: 检查微信配置');
  if (!process.env.WECHAT_APPID || process.env.WECHAT_APPID === 'your_appid_here') {
    console.log('❌ 微信APPID未配置，请更新.env文件中的WECHAT_APPID');
    console.log('💡 在.env文件中添加: WECHAT_APPID=你的小程序appid');
    return false;
  }
  if (!process.env.WECHAT_SECRET || process.env.WECHAT_SECRET === 'your_secret_here') {
    console.log('❌ 微信SECRET未配置，请更新.env文件中的WECHAT_SECRET');
    console.log('💡 在.env文件中添加: WECHAT_SECRET=你的小程序secret');
    return false;
  }
  console.log('✅ 微信配置检查通过\n');
  return true;

  // 测试2: 测试参数验证
  console.log('📋 测试2: 测试参数验证');
  try {
    const response = await makeRequest(`${baseUrl}/auth/login`, 'POST', {});
    console.log('❌ 应该返回错误，因为缺少code参数');
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ 服务器未运行，请先启动服务器: npm start');
    } else {
      console.log('✅ 参数验证正常，错误信息:', error.message);
    }
  }
  console.log('');

  // 测试3: 模拟微信API响应（使用测试code）
  console.log('📋 测试3: 模拟微信登录流程');
  console.log('注意: 实际测试需要真实的微信小程序code');
  console.log('');
  console.log('🔄 登录流程说明:');
  console.log('1. 客户端调用 wx.login() 获取临时登录凭证 code');
  console.log('2. 客户端将 code 发送到服务器 /auth/login 端点');
  console.log('3. 服务器使用 code 调用微信API获取 openid 和 session_key');
  console.log('4. 服务器根据 openid 查找或创建用户');
  console.log('5. 服务器返回用户信息和登录成功状态');
  console.log('');

  // 示例请求格式
  console.log('💡 客户端调用示例:');
  console.log(`
wx.login({
  success: (res) => {
    // res.code 就是临时登录凭证
    wx.request({
      url: '${baseUrl}/auth/login',
      method: 'POST',
      data: {
        code: res.code,
        nickName: '用户昵称',  // 可选
        avatarUrl: '头像URL'  // 可选
      },
      success: (response) => {
        if (response.data.success) {
          console.log('登录成功:', response.data.user);
          // 保存用户信息和sessionKey
          getApp().globalData.user = response.data.user;
          getApp().globalData.sessionKey = response.data.sessionKey;
        }
      }
    });
  }
});
  `);

  console.log('');
  console.log('📋 实际测试步骤:');
  console.log('1. 在微信开发者工具中运行小程序');
  console.log('2. 调用 wx.login() 获取 code');
  console.log('3. 使用以下curl命令测试:');
  console.log(`curl -X POST ${baseUrl}/auth/login \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"code": "你获得的code", "nickName": "测试用户"}\'');
}

// 测试获取用户信息接口
async function testGetUser() {
  console.log('\n📋 测试4: 测试获取用户信息接口');
  console.log('注意: 需要先有用户数据才能测试');
  console.log('使用以下curl命令测试:');
  console.log('curl http://localhost:3000/auth/user/用户openid');
}

// 检查服务器是否运行
async function checkServer() {
  try {
    await makeRequest('http://localhost:3000');
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
  console.log('🎯 微信登录接口测试工具\n');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('');
    return;
  }

  const configValid = await testWechatLogin();
  if (configValid) {
    await testGetUser();
  }

  console.log('\n📋 总结:');
  console.log('1. 确保服务器正在运行 (npm start)');
  console.log('2. 确保.env文件中有正确的微信小程序配置');
  console.log('3. 在微信开发者工具中测试登录流程');
  console.log('4. 使用curl命令手动测试接口');
}

runTests();