require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUserById(userId) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('='.repeat(70));
    console.log(`🔍 查找用户ID: "${userId}" (类型: ${typeof userId})`);
    console.log('='.repeat(70));
    
    // 尝试用字符串查找
    const [stringResults] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [String(userId)]
    );
    
    console.log(`\n字符串搜索结果 (id = "${String(userId)}"):`);
    console.log(stringResults.length > 0 ? `✅ 找到 ${stringResults.length} 个用户` : '❌ 未找到用户');
    
    if (stringResults.length > 0) {
      console.log('用户详情:', stringResults[0]);
    }
    
    // 尝试用数字查找
    const [numberResults] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [Number(userId)]
    );
    
    console.log(`\n数字搜索结果 (id = ${Number(userId)}):`);
    console.log(numberResults.length > 0 ? `✅ 找到 ${numberResults.length} 个用户` : '❌ 未找到用户');
    
    if (numberResults.length > 0) {
      console.log('用户详情:', numberResults[0]);
    }

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

// 检查几个可能的userId
checkUserById(1);
checkUserById('1');
checkUserById('temp-1766853261105');
