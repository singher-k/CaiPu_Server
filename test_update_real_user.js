const http = require('http');

const SERVER = 'http://120.55.4.95:3000';
const USER_ID = 'temp-1766758450569';

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER + path);

    const postData = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`📡 发送请求: ${options.method} ${options.hostname}:${options.port}${options.path}`);
    console.log('📤 请求数据:', postData);

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`📥 响应状态码: ${res.statusCode}`);
        console.log('📥 响应数据:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求错误:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testUpdateUser() {
  console.log('='.repeat(70));
  console.log('🧪 测试用户信息更新接口 - 使用真实用户ID');
  console.log('='.repeat(70));
  console.log(`🎯 用户ID: ${USER_ID}`);
  console.log('');

  console.log('🔍 测试更新用户昵称和头像...');
  console.log('-'.repeat(70));

  try {
    await makeRequest('/api/user/update', {
      userId: USER_ID,
      nickName: '更新后的昵称测试',
      avatarUrl: 'https://updated.example.com/avatar.jpg'
    });

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ 测试完成！');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testUpdateUser().catch(console.error);
