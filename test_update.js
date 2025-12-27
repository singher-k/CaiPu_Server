const http = require('http');

const data = JSON.stringify({
  userId: 1,
  nickName: '测试用户',
  avatarUrl: 'https://example.com/avatar.jpg'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('发送请求到 /api/user/update');
console.log('请求数据:', data);

const req = http.request(options, (res) => {
  console.log('状态码:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('响应:', body);
    try {
      const parsed = JSON.parse(body);
      console.log('解析后:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('解析失败:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
});

req.write(data);
req.end();

console.log('请求已发送...');
