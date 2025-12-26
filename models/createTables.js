const pool = require('../config/database');

async function createTables() {
  try {
    // 创建用户表
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        openid VARCHAR(100) UNIQUE NOT NULL,
        nickName VARCHAR(100) NOT NULL,
        avatarUrl VARCHAR(255),
        sessionKey VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.execute(createUsersTableSQL);
    console.log('Users table created or already exists');

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
    await pool.execute(createRecipesTableSQL);
    console.log('Recipes table created or already exists');

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
    await pool.execute(createFriendsTableSQL);
    console.log('Friends table created or already exists');

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
    await pool.execute(createReservationsTableSQL);
    console.log('Reservations table created or already exists');

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
    await pool.execute(createMessagesTableSQL);
    console.log('Messages table created or already exists');

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

module.exports = { createTables };
