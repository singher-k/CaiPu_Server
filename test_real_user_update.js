const http = require('http');

const SERVER = 'http://120.55.4.95:3000';

async function testWithRealUser() {
    console.log('='.repeat(70));
    console.log('🧪 使用真实用户ID测试用户更新接口');
    console.log('='.repeat(70));
    console.log('');

    // 1. 先登录获取一个真实用户ID
    console.log('🔍 步骤1: 登录获取用户ID...');
    console.log('');

    const loginData = JSON.stringify({
        code: 'mock_test_code_' + Date.now(),
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg'
    });

    await new Promise((resolve, reject) => {
        const options = {
            hostname: '120.55.4.95',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('✅ 登录响应:');
                    console.log(JSON.stringify(parsed, null, 2));

                    if (parsed.success && parsed.user && parsed.user.id) {
                        const userId = parsed.user.id;
                        console.log(`\n🎯 获取到用户ID: ${userId}`);
                        resolve(userId);
                    } else {
                        console.log('❌ 无法获取用户ID');
                        resolve(null);
                    }
                } catch (e) {
                    console.error('❌ 解析失败:', e.message);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error('❌ 请求失败:', e.message);
            resolve(null);
        });

        req.write(loginData);
        req.end();
    });
}

testWithRealUser().catch(console.error);
