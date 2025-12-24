const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Reservation = require('../models/Reservation');

// 发送预约请求
router.post('/', async (req, res) => {
  const { userId, friendId, recipeId, message } = req.body;

  try {
    // 检查用户和好友是否存在
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

    // 检查菜谱是否存在
    const [recipes] = await pool.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [recipeId]
    );
    
    if (recipes.length === 0) {
      return res.status(404).json({ success: false, message: '菜谱不存在' });
    }

    // 检查是否是好友
    const [friendships] = await pool.execute(
      'SELECT * FROM friends WHERE ((userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)) AND status = ?',
      [userId, friendId, friendId, userId, 'accepted']
    );

    if (friendships.length === 0) {
      return res.status(400).json({ success: false, message: '只有好友才能发送预约请求' });
    }

    // 创建预约请求
    const reservation = new Reservation(userId, friendId, recipeId, message);
    
    await pool.execute(
      'INSERT INTO reservations (id, userId, friendId, recipeId, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [reservation.id, reservation.userId, reservation.friendId, reservation.recipeId, reservation.message, reservation.status]
    );

    res.json({ success: true, reservation });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 处理预约请求
router.post('/handle/:reservationId', async (req, res) => {
  const { reservationId } = req.params;
  const { action } = req.body; // action: approve or reject

  try {
    // 查找预约记录
    const [reservations] = await pool.execute(
      'SELECT * FROM reservations WHERE id = ?',
      [reservationId]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ success: false, message: '预约记录不存在' });
    }

    const reservation = reservations[0];
    let feedback = '';
    let newStatus = '';

    // 更新预约状态
    if (action === 'approve') {
      newStatus = 'approved';
      feedback = '再忍五分钟就能开荤啦';
    } else if (action === 'reject') {
      newStatus = 'rejected';
      feedback = '你吃个铲铲你吃';
    } else {
      return res.status(400).json({ success: false, message: '无效的操作' });
    }

    await pool.execute(
      'UPDATE reservations SET status = ? WHERE id = ?',
      [newStatus, reservationId]
    );

    res.json({
      success: true,
      reservation: { ...reservation, status: newStatus, updatedAt: new Date() },
      feedback // 返回反馈消息
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 获取用户收到的预约请求
router.get('/received/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 获取用户收到的所有预约请求及其详细信息
    const [reservations] = await pool.execute(
      `SELECT r.*, u.id as userId, u.nickName, u.avatarUrl, rec.id as recipeId, rec.title, rec.image 
       FROM reservations r 
       JOIN users u ON r.userId = u.id 
       JOIN recipes rec ON r.recipeId = rec.id 
       WHERE r.friendId = ? 
       ORDER BY r.createdAt DESC`,
      [userId]
    );

    const reservationsWithDetails = reservations.map(r => ({
      ...r,
      user: { id: r.userId, nickName: r.nickName, avatarUrl: r.avatarUrl },
      recipe: { id: r.recipeId, title: r.title, image: r.image }
    }));

    res.json({ success: true, reservations: reservationsWithDetails });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 获取用户发送的预约请求
router.get('/sent/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 获取用户发送的所有预约请求及其详细信息
    const [reservations] = await pool.execute(
      `SELECT r.*, u.id as friendId, u.nickName, u.avatarUrl, rec.id as recipeId, rec.title, rec.image 
       FROM reservations r 
       JOIN users u ON r.friendId = u.id 
       JOIN recipes rec ON r.recipeId = rec.id 
       WHERE r.userId = ? 
       ORDER BY r.createdAt DESC`,
      [userId]
    );

    const reservationsWithDetails = reservations.map(r => ({
      ...r,
      friend: { id: r.friendId, nickName: r.nickName, avatarUrl: r.avatarUrl },
      recipe: { id: r.recipeId, title: r.title, image: r.image }
    }));

    res.json({ success: true, reservations: reservationsWithDetails });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

module.exports = router;