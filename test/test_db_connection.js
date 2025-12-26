const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('=== 数据库连接测试脚本 ===');
console.log('正在尝试连接到数据库...');
console.log(`
连接配置：
- 主机：${process.env.DB_HOST}
- 用户名：${process.env.DB_USER}
- 密码：${process.env.DB_PASSWORD ? '已设置' : '未设置'}
- 数据库名：${process.env.DB_NAME}
- 端口：${process.env.DB_PORT}
`);

// 测试数据库连接
async function testConnection() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      connectionLimit: 1
    });
    
    // 尝试获取连接
    const connection = await pool.getConnection();
    console.log('✅ 成功连接到数据库！');
    
    // 关闭连接
    connection.release();
    console.log('✅ 连接已关闭。');
    
    // 关闭连接池
    await pool.end();
    console.log('✅ 连接池已关闭。');
    
  } catch (error) {
    console.error('❌ 数据库连接失败：');
    console.error(`  错误代码：${error.code}`);
    console.error(`  错误消息：${error.message}`);
    console.error(`  SQL状态：${error.sqlState || '未知'}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n可能的原因：');
      console.error('1. 用户名或密码不正确');
      console.error('2. 用户没有访问数据库的权限');
      console.error('3. 主机地址限制了连接');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n可能的原因：');
      console.error('1. MySQL服务未启动');
      console.error('2. MySQL服务端口配置错误');
      console.error('3. 防火墙阻止了连接');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n可能的原因：');
      console.error('1. 数据库不存在');
      console.error('2. 数据库名拼写错误');
    }
  }
}

testConnection();
