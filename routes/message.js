const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Message = require('../models/message');

// 接收服务端消息
router.post('/receive', (req, res) => {
  const message = req.body;
  
  // 这里可以添加消息处理逻辑
  console.log('收到服务端消息:', message);
  
  // 简单的响应
  res.json({ success: true, message: '消息已接收', receivedMessage: message });
});

// 发送消息
router.post('/send', async (req, res) => {
  const { fromUserId, toUserId, content, type } = req.body;
  
  // 验证参数
  if (!fromUserId || !toUserId || !content) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  try {
    const message = new Message(fromUserId, toUserId, content, type);
    
    // 将消息存储到数据库
    await pool.execute(
      'INSERT INTO messages (id, fromUserId, toUserId, content, type, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [message.id, message.fromUserId, message.toUserId, message.content, message.type, message.status, message.createdAt]
    );
    
    res.json({ success: true, message });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ success: false, message: '发送消息失败' });
  }
});

// 获取历史消息
router.get('/history', async (req, res) => {
  const { userId, friendId, limit = 20, offset = 0 } = req.query;
  
  // 验证参数
  if (!userId || !friendId) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }
  
  try {
    // 查询两个用户之间的所有消息
    const [messages] = await pool.execute(
      `SELECT * FROM messages 
       WHERE (fromUserId = ? AND toUserId = ?) OR (fromUserId = ? AND toUserId = ?) 
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      [userId, friendId, friendId, userId, parseInt(limit), parseInt(offset)]
    );
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('获取历史消息失败:', error);
    res.status(500).json({ success: false, message: '获取历史消息失败' });
  }
});

module.exports = router;