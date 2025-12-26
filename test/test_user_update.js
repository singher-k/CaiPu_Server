// 测试用户信息更新接口
const http = require('http');

const BASE_URL = 'http://120.55.4.95:3000/api/user';

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);

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

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testUserUpdate() {
  console.log('=== 测试用户信息更新接口 ===\n');

  // 测试数据
  const testCases = [
    {
      name: '测试1: 更新昵称和头像',
      data: {
        userId: 'temp-1766741832854',
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    },
    {
      name: '测试2: 只更新昵称',
      data: {
        userId: 'temp-1766741832854',
        nickName: '新的昵称'
      }
    },
    {
      name: '测试3: 空用户ID',
      data: {
        userId: '',
        nickName: '测试用户'
      }
    },
    {
      name: '测试4: 不存在的用户',
      data: {
        userId: 'nonexistent-user',
        nickName: '测试用户'
      }
    },
    {
      name: '测试5: 没有提供更新信息',
      data: {
        userId: 'temp-1766741832854'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔍 ${testCase.name}`);
    console.log('请求数据:', JSON.stringify(testCase.data, null, 2));

    try {
      const response = await makeRequest('/update', testCase.data);

      console.log('✅ 响应状态:', response.status);
      console.log('✅ 响应数据:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ 网络错误: 无法连接到服务器 (http://120.55.4.95:3000)');
      } else {
        console.log('❌ 请求错误:', error.message);
      }
    }

    console.log('---\n');
  }
}

// 运行测试
testUserUpdate().catch(console.error);