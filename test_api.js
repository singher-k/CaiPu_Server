const http = require('http');

const data = JSON.stringify({
  userId: 1,
  nickName: '测试用户'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log('状态码:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('响应:', body);
  });
});

req.on('error', (e) => {
  console.error('错误:', e.message);
});

req.write(data);
req.end();

console.log('发送请求...');
