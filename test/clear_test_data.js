const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('=== 删除测试数据脚本 ===');
console.log('正在尝试连接到数据库...');

// 数据库连接配置
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

// 删除测试数据
async function clearTestData() {
  try {
    // 获取连接
    const connection = await pool.getConnection();
    console.log('✅ 成功连接到数据库！');
    
    // 禁用外键检查（临时）
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('⚠️  已临时禁用外键检查');
    
    // 按照正确的顺序删除数据（从依赖关系最末端开始）
    const tablesToClear = [
      'messages',     // 依赖于users
      'reservations', // 依赖于users和recipes
      'friends',      // 依赖于users
      'recipes',      // 依赖于users
      'users'         // 基础表，没有外键依赖
    ];
    
    for (const table of tablesToClear) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`✅ 已清空表 ${table}`);
    }
    
    // 重新启用外键检查
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('⚠️  已重新启用外键检查');
    
    // 关闭连接
    connection.release();
    console.log('\n✅ 所有测试数据已成功删除！');
    
    // 关闭连接池
    await pool.end();
    
  } catch (error) {
    console.error('❌ 删除测试数据失败：');
    console.error(`  错误代码：${error.code}`);
    console.error(`  错误消息：${error.message}`);
    console.error(`  SQL状态：${error.sqlState || '未知'}`);
    
    // 尝试重新启用外键检查（如果失败）
    try {
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('⚠️  已重新启用外键检查');
    } catch (e) {
      console.error('⚠️  无法重新启用外键检查：', e.message);
    }
    
    // 关闭连接池
    await pool.end();
    
  } finally {
    console.log('\n=== 删除测试数据脚本结束 ===');
  }
}

// 执行删除操作
clearTestData();
