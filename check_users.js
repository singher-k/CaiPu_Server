const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'CaiPu123456',
    database: 'myapp_db'
  });

  try {
    const [users] = await connection.execute('SELECT id, wxId, nickName, avatarUrl FROM users');
    console.log('数据库中的用户数量:', users.length);
    console.log('用户列表:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. id=${u.id}, wxId=${u.wxId}, nickName=${u.nickName}`);
    });
  } catch (err) {
    console.error('查询失败:', err.message);
  }

  await connection.end();
}

checkUsers();
