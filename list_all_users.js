require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAllUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('='.repeat(70));
    console.log('📋 数据库中的所有用户');
    console.log('='.repeat(70));
    
    const [rows] = await connection.execute('SELECT id, wxId, nickName, avatarUrl, createdAt FROM users ORDER BY createdAt DESC LIMIT 20');
    
    console.log(`\n共找到 ${rows.length} 个用户：\n`);
    
    rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   微信ID: ${user.wxId}`);
      console.log(`   昵称: ${user.nickName}`);
      console.log(`   头像: ${user.avatarUrl}`);
      console.log(`   创建时间: ${user.createdAt}`);
      console.log('');
    });

    console.log('='.repeat(70));
    console.log('💡 提示：客户端发送的userId必须与上述ID之一完全匹配');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkAllUsers();
