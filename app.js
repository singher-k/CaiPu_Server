const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { createTables } = require('./models/createTables');

// 导入路由
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
const friendRoutes = require('./routes/friend');
const reservationRoutes = require('./routes/reservation');
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/messages', messageRoutes);

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
    await createTables();

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
