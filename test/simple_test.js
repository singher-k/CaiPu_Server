const http = require('http');

function testLogin() {
  console.log('开始测试登录接口...');

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

  console.log('请求数据:', data);
  console.log('请求路径:', options.path);

  const req = http.request(options, (res) => {
    console.log('响应状态码:', res.statusCode);
    console.log('响应头:', JSON.stringify(res.headers, null, 2));

    let body = '';
    res.on('data', (chunk) => {
      console.log('收到数据块:', chunk.length, '字节');
      body += chunk;
    });

    res.on('end', () => {
      console.log('完整响应内容:', body);
      console.log('响应内容长度:', body.length);

      if (body.length > 0) {
        try {
          const parsed = JSON.parse(body);
          console.log('解析后的响应:', parsed);
        } catch (e) {
          console.log('JSON解析失败:', e.message);
        }
      }
    });
  });

  req.on('error', (error) => {
    console.log('请求失败:', error.message);
  });

  req.write(data);
  req.end();
}

testLogin();