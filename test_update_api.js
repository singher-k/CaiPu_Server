const http = require('http');

const SERVER = 'http://120.55.4.95:3000';

async function testUpdateAPI() {
    console.log('='.repeat(70));
    console.log('🧪 测试用户更新接口（使用已存在的用户）');
    console.log('='.repeat(70));
    console.log('');

    const userId = 'temp-1766853261105';

    console.log(`🔍 使用用户ID: ${userId}`);
    console.log('');

    console.log('🔍 测试更新接口...');

    const updateData = JSON.stringify({
        userId: userId,
        nickName: '更新后的昵称',
        avatarUrl: 'https://example.com/new_avatar.jpg'
    });

    console.log('发送更新请求:', updateData);

    await new Promise((resolve) => {
        const options = {
            hostname: '120.55.4.95',
            port: 3000,
            path: '/api/user/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(updateData)
            }
        };

        const req = http.request(options, (res) => {
            console.log(`响应状态码: ${res.statusCode}`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('响应内容:', data);
                try {
                    const parsed = JSON.parse(data);
                    console.log('');
                    console.log('✅ 更新响应:');
                    console.log(JSON.stringify(parsed, null, 2));

                    if (parsed.success) {
                        console.log('');
                        console.log('🎉 测试成功！用户信息更新接口工作正常！');
                    } else {
                        console.log('');
                        console.log('❌ 更新失败:', parsed.message);
                    }
                } catch (e) {
                    console.error('❌ 解析失败:', e.message);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error('❌ 请求失败:', e.message);
            resolve();
        });

        req.write(updateData);
        req.end();
    });

    console.log('');
    console.log('='.repeat(70));
    console.log('🧪 测试完成');
    console.log('='.repeat(70));
}

testUpdateAPI().catch(console.error);
