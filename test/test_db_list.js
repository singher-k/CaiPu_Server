const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('=== 数据库列表测试脚本 ===');
console.log('正在尝试连接到数据库服务器...');
console.log(`
连接配置：
- 主机：${process.env.DB_HOST}
- 用户名：${process.env.DB_USER}
- 密码：${process.env.DB_PASSWORD ? '已设置' : '未设置'}
- 端口：${process.env.DB_PORT}
`);

// 测试数据库连接并列出所有数据库
async function testConnection() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      connectionLimit: 1,
      database: null // 不指定数据库名
    });
    
    // 尝试获取连接
    const connection = await pool.getConnection();
    console.log('✅ 成功连接到数据库服务器！');
    
    // 查询所有可用的数据库
    const [rows] = await connection.execute('SHOW DATABASES');
    console.log('\n🗂️  可用的数据库列表：');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.Database}`);
    });
    
    // 关闭连接
    connection.release();
    console.log('\n✅ 连接已关闭。');
    
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
      console.error('2. 用户没有访问数据库服务器的权限');
      console.error('3. 主机地址限制了连接');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n可能的原因：');
      console.error('1. MySQL服务未启动');
      console.error('2. MySQL服务端口配置错误');
      console.error('3. 防火墙阻止了连接');
      console.error('4. 网络连接问题');
    }
  }
}

testConnection();
