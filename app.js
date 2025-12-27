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

// 全局请求日志中间件
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('请求头:', req.headers);
  console.log('请求体:', req.body);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes); // 用户相关接口，指向auth路由
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
  console.error('=== 服务器错误 ===');
  console.error('错误类型:', err.constructor.name);
  console.error('错误消息:', err.message);
  console.error('错误堆栈:', err.stack);
  console.error('请求路径:', req.path);
  console.error('请求方法:', req.method);
  console.error('===================');
  res.status(500).json({ 
    error: '服务器内部错误',
    message: err.message 
  });
});

// 启动服务器
async function startServer() {
  // 使用Promise.race设置超时机制
  const createTablesWithTimeout = () => {
    return Promise.race([
      createTables(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('数据库连接超时 (ETIMEDOUT)')), 10000)
      )
    ]);
  };

  try {
    // 创建数据库表
    console.log('🔧 正在创建数据库表...');
    await createTablesWithTimeout();
    console.log('✅ 数据库表创建成功');
  } catch (error) {
    console.warn('⚠️ 数据库连接失败，继续启动服务器:', error.message);
    // 记录具体的错误类型
    if (error.code === 'ETIMEDOUT' || error.message.includes('超时')) {
      console.warn('⚠️ 检测到数据库连接超时错误，服务器将在没有数据库连接的情况下启动');
    }
  }

  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

startServer();
