const http = require('http');

const data = JSON.stringify({
    userId: 'temp-1766742956182',
    nickName: '木村拓哉',
    avatarUrl: 'wxfile://tmp_1c82b2094f06d5bbcc68c702634b80ec.jpg'
});

console.log('发送的JSON数据:', data);

const options = {
    hostname: '120.55.4.95',
    port: 3000,
    path: '/api/user/update',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log('请求配置:', options);

const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log('响应头:', res.headers);
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
        console.log('收到数据块:', chunk.toString());
    });
    res.on('end', () => {
        console.log('完整响应体:', body);
    });
});

req.on('error', (error) => {
    console.error('请求错误:', error.message);
});

req.write(data);
req.end();

console.log('发送测试请求...');
