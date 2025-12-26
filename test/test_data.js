const mysql = require('mysql2/promise');
const uuid = require('uuid');
require('dotenv').config();

// 数据库连接配置
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10
});

// 生成测试用户数据
const generateTestUsers = () => {
    return [
        {
            id: uuid.v4(),
            wxId: 'wx_test_user_1',
            nickName: '测试用户1',
            avatarUrl: 'https://example.com/avatar1.jpg'
        },
        {
            id: uuid.v4(),
            wxId: 'wx_test_user_2',
            nickName: '测试用户2',
            avatarUrl: 'https://example.com/avatar2.jpg'
        },
        {
            id: uuid.v4(),
            wxId: 'wx_test_user_3',
            nickName: '测试用户3',
            avatarUrl: 'https://example.com/avatar3.jpg'
        },
        {
            id: uuid.v4(),
            wxId: 'wx_test_user_4',
            nickName: '测试用户4',
            avatarUrl: 'https://example.com/avatar4.jpg'
        },
        {
            id: uuid.v4(),
            wxId: 'wx_test_user_5',
            nickName: '测试用户5',
            avatarUrl: 'https://example.com/avatar5.jpg'
        }
    ];
};

// 生成测试菜谱数据
const generateTestRecipes = (userIds) => {
    return [
        {
            id: uuid.v4(),
            title: '宫保鸡丁',
            image: 'https://example.com/gongbao.jpg',
            category: '川菜',
            difficulty: '简单',
            time: 30,
            ingredients: JSON.stringify([
                { name: '鸡胸肉', amount: '200g' },
                { name: '花生米', amount: '50g' },
                { name: '干辣椒', amount: '10个' },
                { name: '葱', amount: '2根' },
                { name: '姜', amount: '5片' },
                { name: '蒜', amount: '3瓣' }
            ]),
            steps: JSON.stringify([
                '鸡胸肉切丁，用盐、料酒、淀粉腌制15分钟',
                '花生米炸至金黄捞出',
                '锅中放油，放入干辣椒炒香',
                '放入鸡丁翻炒至变色',
                '加入葱、姜、蒜翻炒',
                '加入调味汁翻炒均匀',
                '最后放入花生米翻炒即可'
            ]),
            userId: userIds[0]
        },
        {
            id: uuid.v4(),
            title: '西红柿炒鸡蛋',
            image: 'https://example.com/tomato.jpg',
            category: '家常菜',
            difficulty: '简单',
            time: 20,
            ingredients: JSON.stringify([
                { name: '西红柿', amount: '2个' },
                { name: '鸡蛋', amount: '3个' },
                { name: '盐', amount: '适量' },
                { name: '糖', amount: '适量' }
            ]),
            steps: JSON.stringify([
                '鸡蛋打散，加入少许盐',
                '锅中放油，倒入鸡蛋液翻炒至凝固盛出',
                '锅中留底油，放入西红柿块翻炒',
                '加入糖和盐调味',
                '放入炒好的鸡蛋翻炒均匀即可'
            ]),
            userId: userIds[1]
        },
        {
            id: uuid.v4(),
            title: '红烧肉',
            image: 'https://example.com/hongshao.jpg',
            category: '鲁菜',
            difficulty: '中等',
            time: 60,
            ingredients: JSON.stringify([
                { name: '五花肉', amount: '500g' },
                { name: '冰糖', amount: '30g' },
                { name: '料酒', amount: '2勺' },
                { name: '生抽', amount: '2勺' },
                { name: '老抽', amount: '1勺' },
                { name: '葱', amount: '1根' },
                { name: '姜', amount: '5片' },
                { name: '八角', amount: '2个' }
            ]),
            steps: JSON.stringify([
                '五花肉切块，焯水去血沫',
                '锅中放油，放入冰糖炒出糖色',
                '放入五花肉翻炒至上色',
                '加入料酒、生抽、老抽翻炒',
                '加入葱姜八角和适量水',
                '大火烧开后转小火炖40分钟',
                '最后大火收汁即可'
            ]),
            userId: userIds[2]
        },
        {
            id: uuid.v4(),
            title: '鱼香肉丝',
            image: 'https://example.com/yuxiang.jpg',
            category: '川菜',
            difficulty: '中等',
            time: 35,
            ingredients: JSON.stringify([
                { name: '猪肉', amount: '150g' },
                { name: '胡萝卜', amount: '1根' },
                { name: '青椒', amount: '1个' },
                { name: '木耳', amount: '适量' },
                { name: '葱', amount: '1根' },
                { name: '姜', amount: '5片' },
                { name: '蒜', amount: '3瓣' }
            ]),
            steps: JSON.stringify([
                '猪肉切丝，用盐、料酒、淀粉腌制',
                '胡萝卜、青椒、木耳切丝',
                '调鱼香汁：糖、醋、生抽、淀粉、水',
                '锅中放油，放入肉丝翻炒至变色',
                '放入葱姜蒜炒香',
                '放入胡萝卜、青椒、木耳翻炒',
                '倒入鱼香汁翻炒均匀即可'
            ]),
            userId: userIds[3]
        },
        {
            id: uuid.v4(),
            title: '麻婆豆腐',
            image: 'https://example.com/mapo.jpg',
            category: '川菜',
            difficulty: '简单',
            time: 25,
            ingredients: JSON.stringify([
                { name: '豆腐', amount: '500g' },
                { name: '牛肉末', amount: '50g' },
                { name: '豆瓣酱', amount: '2勺' },
                { name: '花椒粉', amount: '适量' },
                { name: '葱', amount: '1根' },
                { name: '姜', amount: '5片' },
                { name: '蒜', amount: '3瓣' }
            ]),
            steps: JSON.stringify([
                '豆腐切块，焯水备用',
                '锅中放油，放入牛肉末翻炒至变色',
                '放入豆瓣酱、葱姜蒜炒香',
                '加入适量水，放入豆腐',
                '煮5分钟后调味',
                '最后撒上花椒粉和葱花即可'
            ]),
            userId: userIds[4]
        }
    ];
};

// 生成测试好友关系
const generateTestFriends = (userIds) => {
    return [
        {
            id: uuid.v4(),
            userId: userIds[0],
            friendId: userIds[1],
            status: 'accepted'
        },
        {
            id: uuid.v4(),
            userId: userIds[0],
            friendId: userIds[2],
            status: 'accepted'
        },
        {
            id: uuid.v4(),
            userId: userIds[1],
            friendId: userIds[3],
            status: 'accepted'
        },
        {
            id: uuid.v4(),
            userId: userIds[2],
            friendId: userIds[4],
            status: 'accepted'
        },
        {
            id: uuid.v4(),
            userId: userIds[3],
            friendId: userIds[0],
            status: 'pending'
        }
    ];
};

// 生成测试预约
const generateTestReservations = (userIds, recipeIds) => {
    return [
        {
            id: uuid.v4(),
            userId: userIds[0],
            friendId: userIds[1],
            recipeId: recipeIds[0],
            message: '明天一起做饭吧！',
            status: 'accepted'
        },
        {
            id: uuid.v4(),
            userId: userIds[1],
            friendId: userIds[2],
            recipeId: recipeIds[2],
            message: '周末来我家做红烧肉',
            status: 'pending'
        },
        {
            id: uuid.v4(),
            userId: userIds[2],
            friendId: userIds[3],
            recipeId: recipeIds[3],
            message: '想学习做鱼香肉丝',
            status: 'accepted'
        }
    ];
};

// 生成测试消息
const generateTestMessages = (userIds) => {
    return [
        {
            id: uuid.v4(),
            fromUserId: userIds[0],
            toUserId: userIds[1],
            content: '你好，一起做饭吗？',
            type: 'text',
            status: 'read'
        },
        {
            id: uuid.v4(),
            fromUserId: userIds[1],
            toUserId: userIds[0],
            content: '好啊，什么时候？',
            type: 'text',
            status: 'read'
        },
        {
            id: uuid.v4(),
            fromUserId: userIds[0],
            toUserId: userIds[1],
            content: '明天晚上7点怎么样？',
            type: 'text',
            status: 'sent'
        },
        {
            id: uuid.v4(),
            fromUserId: userIds[2],
            toUserId: userIds[3],
            content: '这个菜谱看起来不错！',
            type: 'text',
            status: 'read'
        },
        {
            id: uuid.v4(),
            fromUserId: userIds[3],
            toUserId: userIds[2],
            content: '谢谢，有空一起做',
            type: 'text',
            status: 'sent'
        }
    ];
};

// 插入测试数据到数据库
const insertTestData = async () => {
    try {
        console.log('开始插入测试数据...');

        // 插入用户
        const testUsers = generateTestUsers();
        const userIds = testUsers.map(user => user.id);
        for (const user of testUsers) {
            await pool.execute(
                'INSERT INTO users (id, wxId, nickName, avatarUrl) VALUES (?, ?, ?, ?)',
                [user.id, user.wxId, user.nickName, user.avatarUrl]
            );
        }
        console.log('成功插入测试用户数据');

        // 插入菜谱
        const testRecipes = generateTestRecipes(userIds);
        const recipeIds = testRecipes.map(recipe => recipe.id);
        for (const recipe of testRecipes) {
            await pool.execute(
                'INSERT INTO recipes (id, title, image, category, difficulty, time, ingredients, steps, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [recipe.id, recipe.title, recipe.image, recipe.category, recipe.difficulty, recipe.time, recipe.ingredients, recipe.steps, recipe.userId]
            );
        }
        console.log('成功插入测试菜谱数据');

        // 插入好友关系
        const testFriends = generateTestFriends(userIds);
        for (const friend of testFriends) {
            await pool.execute(
                'INSERT INTO friends (id, userId, friendId, status) VALUES (?, ?, ?, ?)',
                [friend.id, friend.userId, friend.friendId, friend.status]
            );
        }
        console.log('成功插入测试好友关系数据');

        // 插入预约
        const testReservations = generateTestReservations(userIds, recipeIds);
        for (const reservation of testReservations) {
            await pool.execute(
                'INSERT INTO reservations (id, userId, friendId, recipeId, message, status) VALUES (?, ?, ?, ?, ?, ?)',
                [reservation.id, reservation.userId, reservation.friendId, reservation.recipeId, reservation.message, reservation.status]
            );
        }
        console.log('成功插入测试预约数据');

        // 插入消息
        const testMessages = generateTestMessages(userIds);
        for (const message of testMessages) {
            await pool.execute(
                'INSERT INTO messages (id, fromUserId, toUserId, content, type, status) VALUES (?, ?, ?, ?, ?, ?)',
                [message.id, message.fromUserId, message.toUserId, message.content, message.type, message.status]
            );
        }
        console.log('成功插入测试消息数据');

        console.log('所有测试数据插入完成！');

    } catch (error) {
        console.error('插入测试数据时发生错误:', error);
    } finally {
        // 关闭数据库连接
        await pool.end();
    }
};

// 执行插入测试数据
insertTestData();
