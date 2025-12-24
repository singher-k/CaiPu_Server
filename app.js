const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { createUsersTable } = require('./models/createTables');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 简单路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to my API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 用户路由示例
app.get('/api/users', async (req, res) => {
  try {
    const pool = require('./config/database');
    const [rows] = await pool.execute('SELECT id, username, email, created_at FROM users');
    res.json({ users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
async function startServer() {
  try {
    // 创建数据库表
    await createUsersTable();
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
