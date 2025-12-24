const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Friend = require('../models/Friend');

// 发送好友请求
router.post('/request', async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    // 检查用户是否存在
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    const [friends] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [friendId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    if (friends.length === 0) {
      return res.status(404).json({ success: false, message: '好友不存在' });
    }

    // 检查是否已经是好友或已有请求
    const [existingRequests] = await pool.execute(
      'SELECT * FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)',
      [userId, friendId, friendId, userId]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ success: false, message: '好友关系已存在或请求已发送' });
    }

    // 创建好友请求
    const friendRequest = new Friend(userId, friendId);

    await pool.execute(
      'INSERT INTO friends (id, userId, friendId, status) VALUES (?, ?, ?, ?)',
      [friendRequest.id, friendRequest.userId, friendRequest.friendId, friendRequest.status]
    );

    res.json({ success: true, friendRequest });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 处理好友请求
router.post('/handle/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // action: accept or reject

  try {
    // 检查请求是否存在
    const [friendRequests] = await pool.execute(
      'SELECT * FROM friends WHERE id = ?',
      [requestId]
    );

    if (friendRequests.length === 0) {
      return res.status(404).json({ success: false, message: '好友请求不存在' });
    }

    const friendRequest = friendRequests[0];

    // 更新请求状态
    if (action === 'accept') {
      await pool.execute(
        'UPDATE friends SET status = ? WHERE id = ?',
        ['accepted', requestId]
      );

      // 创建反向的好友关系
      const reverseFriend = new Friend(friendRequest.friendId, friendRequest.userId);
      reverseFriend.status = 'accepted';

      await pool.execute(
        'INSERT INTO friends (id, userId, friendId, status) VALUES (?, ?, ?, ?)',
        [reverseFriend.id, reverseFriend.userId, reverseFriend.friendId, reverseFriend.status]
      );

      res.json({ success: true, message: '好友请求已接受', friendRequest: { ...friendRequest, status: 'accepted' } });
    } else if (action === 'reject') {
      await pool.execute(
        'UPDATE friends SET status = ? WHERE id = ?',
        ['rejected', requestId]
      );

      res.json({ success: true, message: '好友请求已拒绝', friendRequest: { ...friendRequest, status: 'rejected' } });
    } else {
      return res.status(400).json({ success: false, message: '无效的操作' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 获取用户好友列表
router.get('/list/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 获取已接受的好友关系和好友信息
    const [friendships] = await pool.execute(
      `SELECT f.id, f.friendId, u.nickName, u.avatarUrl, f.createdAt 
       FROM friends f 
       JOIN users u ON f.friendId = u.id 
       WHERE f.userId = ? AND f.status = 'accepted'`,
      [userId]
    );

    res.json({ success: true, friends: friendships });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 移除好友
router.delete('/remove/:userId/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    // 删除双向好友关系
    await pool.execute(
      'DELETE FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)',
      [userId, friendId, friendId, userId]
    );

    res.json({ success: true, message: '好友已移除' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 获取好友菜单
router.get('/menu/:friendId', async (req, res) => {
  const { friendId } = req.params;

  try {
    // 获取好友的菜谱
    const [recipes] = await pool.execute(
      'SELECT * FROM recipes WHERE userId = ? ORDER BY createdAt DESC',
      [friendId]
    );

    // 解析JSON字段
    const parsedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      steps: JSON.parse(recipe.steps)
    }));

    res.json({ success: true, recipes: parsedRecipes });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

module.exports = router;