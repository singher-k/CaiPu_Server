const http = require('http');

const REMOTE_SERVER = 'http://120.55.4.95:3000';

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    console.log(`📡 连接远程服务器: ${options.hostname}:${options.port}`);
    console.log(`🔗 请求路径: ${options.path}`);
    console.log(`📡 请求方法: ${options.method}`);

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`📥 响应状态码: ${res.statusCode}`);
        console.log(`📥 响应头:`, res.headers);

        if (responseData.length > 500) {
          console.log(`📥 响应数据(前500字符): ${responseData.substring(0, 500)}...`);
        } else {
          console.log(`📥 响应数据: ${responseData}`);
        }

        resolve({ status: res.statusCode, headers: res.headers, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ 连接错误: ${error.code} - ${error.message}`);

      if (error.code === 'ECONNREFUSED') {
        console.error('🔴 无法连接到远程服务器！');
        console.error('可能的原因:');
        console.error('  1. 服务器未启动');
        console.error('  2. IP地址或端口错误');
        console.error('  3. 防火墙阻止连接');
        console.error('  4. 服务器已关闭');
      }

      reject(error);
    });

    req.setTimeout(5000, () => {
      console.error('❌ 连接超时（5秒）');
      req.destroy();
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testRemoteServer() {
  console.log('='.repeat(70));
  console.log('🌐 测试远程服务器连接');
  console.log('='.repeat(70));
  console.log(`🎯 目标服务器: ${REMOTE_SERVER}`);
  console.log('');

  const tests = [
    {
      name: '1. 测试健康检查接口',
      url: `${REMOTE_SERVER}/health`,
      data: null
    },
    {
      name: '2. 测试用户更新接口 (完整参数)',
      url: `${REMOTE_SERVER}/api/user/update`,
      data: {
        userId: 'test-user-123',
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    },
    {
      name: '3. 测试用户更新接口 (空ID - 应该返回400)',
      url: `${REMOTE_SERVER}/api/user/update`,
      data: {
        userId: '',
        nickName: '测试用户'
      }
    },
    {
      name: '4. 测试不存在的路由 (应该返回404)',
      url: `${REMOTE_SERVER}/api/user/not-exist`,
      data: null
    }
  ];

  for (const test of tests) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 ${test.name}`);
    console.log('='.repeat(70));

    try {
      const response = await makeRequest(test.url, test.data);
      console.log(`\n✅ 测试完成 - 状态码: ${response.status}`);
    } catch (error) {
      console.log(`\n❌ 测试失败 - ${error.message}`);
    }

    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('='.repeat(70));
  console.log('✅ 远程服务器连接测试完成');
  console.log('='.repeat(70));
}

testRemoteServer().catch(console.error);
