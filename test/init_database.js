const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('=== 数据库初始化脚本 ===');
console.log('正在尝试连接到数据库服务器...');

// 数据库连接配置（不指定数据库名，先连接到服务器）
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionLimit: 10
});

// 初始化数据库
async function initDatabase() {
  try {
    // 获取连接
    const connection = await pool.getConnection();
    console.log('✅ 成功连接到数据库服务器！');

    // 创建数据库（如果不存在）
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ 成功创建/确认数据库 ${process.env.DB_NAME}`);

    // 切换到新创建的数据库
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log(`✅ 已切换到数据库 ${process.env.DB_NAME}`);

    // 创建用户表
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        wxId VARCHAR(100) UNIQUE NOT NULL,
        nickName VARCHAR(100) NOT NULL,
        avatarUrl VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await connection.execute(createUsersTableSQL);
    console.log('✅ 成功创建用户表 (users)');

    // 创建菜谱表
    const createRecipesTableSQL = `
      CREATE TABLE IF NOT EXISTS recipes (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        image VARCHAR(255),
        category VARCHAR(50) NOT NULL,
        difficulty VARCHAR(20) NOT NULL,
        time INT NOT NULL,
        ingredients TEXT NOT NULL,
        steps TEXT NOT NULL,
        userId VARCHAR(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createRecipesTableSQL);
    console.log('✅ 成功创建菜谱表 (recipes)');

    // 创建好友表
    const createFriendsTableSQL = `
      CREATE TABLE IF NOT EXISTS friends (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        friendId VARCHAR(36) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friendId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_friendship (userId, friendId)
      )
    `;
    await connection.execute(createFriendsTableSQL);
    console.log('✅ 成功创建好友表 (friends)');

    // 创建预约表
    const createReservationsTableSQL = `
      CREATE TABLE IF NOT EXISTS reservations (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        friendId VARCHAR(36) NOT NULL,
        recipeId VARCHAR(36) NOT NULL,
        message TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friendId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createReservationsTableSQL);
    console.log('✅ 成功创建预约表 (reservations)');

    // 创建消息表
    const createMessagesTableSQL = `
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        fromUserId VARCHAR(36) NOT NULL,
        toUserId VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'text',
        status VARCHAR(20) NOT NULL DEFAULT 'sent',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createMessagesTableSQL);
    console.log('✅ 成功创建消息表 (messages)');

    // 关闭连接
    connection.release();
    console.log('\n✅ 所有操作完成！');
    console.log('✅ 表结构已成功初始化。');

    // 关闭连接池
    await pool.end();

  } catch (error) {
    console.error('❌ 数据库初始化失败：');
    console.error(`  错误代码：${error.code}`);
    console.error(`  错误消息：${error.message}`);
    console.error(`  SQL状态：${error.sqlState || '未知'}`);

    // 关闭连接池
    await pool.end();

  } finally {
    console.log('\n=== 数据库初始化脚本结束 ===');
  }
}

// 执行数据库初始化
initDatabase();
