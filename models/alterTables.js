const pool = require('../config/database');

async function addSessionKey() {
  try {
    console.log('正在添加 sessionKey 字段到 users 表...');
    
    // 首先尝试添加字段
    await pool.execute('ALTER TABLE users ADD COLUMN sessionKey VARCHAR(255)');
    console.log('✅ sessionKey 字段添加成功');
    
    // 显示更新后的表结构
    const [rows] = await pool.execute('DESCRIBE users');
    console.log('更新后的 Users 表结构:');
    rows.forEach(row => {
      console.log(`- ${row.Field}: ${row.Type}`);
    });
    
  } catch (error) {
    // 检查是否是字段已存在的错误
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ sessionKey 字段已存在');
      
      // 显示当前表结构
      const [rows] = await pool.execute('DESCRIBE users');
      console.log('当前 Users 表结构:');
      rows.forEach(row => {
        console.log(`- ${row.Field}: ${row.Type}`);
      });
    } else {
      console.error('❌ 错误:', error.message);
    }
  }
}

// 执行函数
addSessionKey();