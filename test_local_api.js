const http = require('http');

const BASE_URL = 'http://localhost:3000';

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

        console.log(`📡 发送请求: ${options.method} ${options.hostname}:${options.port}${options.path}`);
        console.log('📤 请求数据:', postData);

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log(`📥 响应状态码: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(responseData);
                    console.log('📥 响应数据:', JSON.stringify(parsed, null, 2));
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    console.log('📥 响应原始数据:', responseData);
                    resolve({ status: res.statusCode, data: responseData });
                }
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

async function testUserUpdate() {
    console.log('='.repeat(60));
    console.log('🧪 测试用户信息更新接口 - 本地环境');
    console.log('='.repeat(60));
    console.log('');

    const testCases = [
        {
            name: '测试1: 完整参数更新',
            data: {
                userId: 'test-user-123',
                nickName: '测试用户',
                avatarUrl: 'https://example.com/avatar.jpg'
            }
        },
        {
            name: '测试2: 只更新昵称',
            data: {
                userId: 'test-user-123',
                nickName: '新昵称测试'
            }
        },
        {
            name: '测试3: 空用户ID（应该返回400错误）',
            data: {
                userId: '',
                nickName: '测试用户'
            }
        },
        {
            name: '测试4: 没有提供更新信息（应该返回400错误）',
            data: {
                userId: 'test-user-123'
            }
        },
        {
            name: '测试5: 测试健康检查',
            data: null
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n🔍 ${testCase.name}`);
        console.log('-'.repeat(60));

        try {
            if (testCase.name.includes('健康检查')) {
                const response = await http.get(`${BASE_URL}/health`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        console.log(`✅ 响应状态: ${res.statusCode}`);
                        console.log(`✅ 响应数据: ${data}`);
                    });
                });
            } else {
                await makeRequest('/api/user/update', testCase.data);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ 无法连接到服务器');
            } else {
                console.log('❌ 请求失败:', error.message);
            }
        }

        console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ 测试完成');
    console.log('='.repeat(60));
}

testUserUpdate().catch(console.error);
