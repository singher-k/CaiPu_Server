require('dotenv').config();
const mysql = require('mysql2/promise');

async function insertTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const userId = 'temp-1766853261105';
  const wxId = 'test_wx_' + Date.now();

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length > 0) {
      console.log('用户已存在:', rows[0]);
    } else {
      await connection.execute(
        'INSERT INTO users (id, nickName, avatarUrl, wxId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [userId, '测试用户', 'https://example.com/avatar.jpg', wxId]
      );
      console.log('✅ 测试用户插入成功');
    }

    const [result] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    console.log('当前用户数据:', result[0]);

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

insertTestUser();
