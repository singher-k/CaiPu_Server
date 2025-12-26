const http = require('http');

function testSimpleRoute() {
  console.log('测试根路径...');

  const req = http.get('http://localhost:3000/', (res) => {
    console.log('根路径状态:', res.statusCode);
    
    let body = '';
    res.on('data', (chunk) => body += chunk);
    
    res.on('end', () => {
      console.log('根路径响应:', body);
    });
  });

  req.on('error', (error) => {
    console.log('根路径失败:', error.message);
  });
}

function testAuthRoute() {
  console.log('测试认证路由...');

  const data = JSON.stringify({
    code: 'test_code_12345',
    nickName: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log('认证路由状态:', res.statusCode);
    
    let body = '';
    res.on('data', (chunk) => body += chunk);
    
    res.on('end', () => {
      console.log('认证路由响应:', body);
    });
  });

  req.on('error', (error) => {
    console.log('认证路由失败:', error.message);
  });

  req.end();
}

testSimpleRoute();

setTimeout(() => {
  testAuthRoute();
}, 1000);