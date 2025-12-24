const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const User = require('../models/User');

// 微信用户登录/注册
router.post('/login', async (req, res) => {
  const { wxId, nickName, avatarUrl } = req.body;

  if (!wxId) {
    return res.status(400).json({ error: '微信ID不能为空' });
  }

  try {
    // 查找是否已存在该用户
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE wxId = ?',
      [wxId]
    );

    if (existingUsers.length > 0) {
      // 更新用户信息
      await pool.execute(
        'UPDATE users SET nickName = ?, avatarUrl = ? WHERE wxId = ?',
        [nickName || existingUsers[0].nickName, avatarUrl || existingUsers[0].avatarUrl, wxId]
      );

      // 获取更新后的用户信息
      const [updatedUsers] = await pool.execute(
        'SELECT * FROM users WHERE wxId = ?',
        [wxId]
      );

      return res.json({ success: true, user: updatedUsers[0] });
    } else {
      // 创建新用户
      const newUser = new User(wxId, nickName || '微信用户', avatarUrl);

      await pool.execute(
        'INSERT INTO users (id, wxId, nickName, avatarUrl) VALUES (?, ?, ?, ?)',
        [newUser.id, newUser.wxId, newUser.nickName, newUser.avatarUrl]
      );

      return res.status(201).json({ success: true, user: newUser });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: '数据库错误' });
  }
});

// 获取用户信息
router.get('/user/:wxId', async (req, res) => {
  const { wxId } = req.params;

  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE wxId = ?',
      [wxId]
    );

    if (users.length > 0) {
      res.json({ success: true, user: users[0] });
    } else {
      res.status(404).json({ error: '用户不存在' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: '数据库错误' });
  }
});

module.exports = router;
