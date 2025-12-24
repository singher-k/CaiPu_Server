const pool = require('../config/database');

async function createUsersTable() {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await pool.execute(createTableSQL);
    console.log('Users table created or already exists');
    
    // 插入测试数据（可选）
    const insertSQL = `
      INSERT IGNORE INTO users (username, email, password) 
      VALUES (?, ?, ?)
    `;
    await pool.execute(insertSQL, ['admin', 'admin@example.com', 'hashed_password']);
    
    console.log('Test data inserted');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

module.exports = { createUsersTable };
