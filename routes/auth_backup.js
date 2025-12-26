const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const User = require('../models/User');
const https = require('https');
const { URL } = require('url');

// 微信用户登录/注册
router.post('/login', async (req, res) => {
  console.log('=== 登录请求开始 ===');
  console.log('请求体:', JSON.stringify(req.body));

  const { code, nickName, avatarUrl } = req.body;
  console.log('提取的参数:', { code, nickName, avatarUrl });

  if (!code) {
    console.log('错误: code参数为空');
    return res.status(400).json({ error: '登录凭证code不能为空' });
  }

  try {
    console.log('进入try块');
    // 1. 使用code获取微信用户信息
    const wechatConfig = {
      appid: process.env.WECHAT_APPID,
      secret: process.env.WECHAT_SECRET,
      grant_type: process.env.WECHAT_GRANT_TYPE || 'authorization_code'
    };

    console.log('微信配置:', {
      appid: wechatConfig.appid,
      secret: wechatConfig.secret ? '***' + wechatConfig.secret.slice(-4) : 'undefined',
      grant_type: wechatConfig.grant_type
    });

    if (!wechatConfig.appid || !wechatConfig.secret || wechatConfig.appid === 'your_appid_here') {
      console.log('微信配置检查失败');
      return res.status(500).json({ error: '微信配置错误，请检查环境变量中的WECHAT_APPID和WECHAT_SECRET' });
    }

    console.log('正在调用微信API获取用户信息...');

    const wxUrl = new URL('https://api.weixin.qq.com/sns/jscode2session');
    wxUrl.searchParams.append('appid', wechatConfig.appid);
    wxUrl.searchParams.append('secret', wechatConfig.secret);
    wxUrl.searchParams.append('js_code', code);
    wxUrl.searchParams.append('grant_type', wechatConfig.grant_type);

    const wxResponse = await new Promise((resolve, reject) => {
      const req = https.get(wxUrl.toString(), (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid response from WeChat API'));
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('WeChat API request timeout'));
      });
    });

    const { openid, session_key, errcode, errmsg } = wxResponse;

    if (errcode) {
      console.error('微信API错误:', { errcode, errmsg });
      return res.status(400).json({
        error: '微信登录失败',
        details: errmsg,
        code: errcode
      });
    }

    if (!openid) {
      return res.status(400).json({ error: '未能获取到用户openid' });
    }

    console.log('成功获取用户openid:', openid);

    // 2. 根据openid查找或创建用户
    let user;
    try {
      const [existingUsers] = await pool.execute(
        'SELECT * FROM users WHERE openid = ?',
        [openid]
      );

      if (existingUsers.length > 0) {
        // 更新用户信息
        await pool.execute(
          'UPDATE users SET nickName = ?, avatarUrl = ?, sessionKey = ? WHERE openid = ?',
          [nickName || existingUsers[0].nickName, avatarUrl || existingUsers[0].avatarUrl, session_key, openid]
        );

        // 获取更新后的用户信息
        const [updatedUsers] = await pool.execute(
          'SELECT * FROM users WHERE openid = ?',
          [openid]
        );
        user = updatedUsers[0];

        console.log('用户信息已更新:', user.id);
      } else {
        // 创建新用户
        const newUser = new User(openid, nickName || '微信用户', avatarUrl);
        newUser.sessionKey = session_key;
        newUser.openid = openid;

        await pool.execute(
          'INSERT INTO users (id, openid, nickName, avatarUrl, sessionKey) VALUES (?, ?, ?, ?, ?)',
          [newUser.id, newUser.openid, newUser.nickName, newUser.avatarUrl, newUser.sessionKey]
        );

        user = newUser;
        console.log('新用户创建成功:', user.id);
      }
    } catch (dbError) {
      console.error('数据库操作失败:', dbError);

      if (dbError.code === 'ECONNABORTED' || dbError.code === 'ETIMEDOUT') {
        return res.status(503).json({
          error: '数据库连接超时',
          details: '无法连接到数据库服务器，请稍后重试',
          code: dbError.code
        });
      }

      if (dbError.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(503).json({
          error: '数据库访问被拒绝',
          details: '数据库权限配置错误，请检查连接配置',
          code: dbError.code
        });
      }

      return res.status(503).json({
        error: '数据库操作失败',
        details: '无法执行用户数据操作，请稍后重试',
        code: dbError.code
      });
    }

    // 3. 返回用户信息和登录成功标识
    res.json({
      success: true,
      user: {
        id: user.id,
        openid: user.openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      sessionKey: session_key
    });

  } catch (error) {
    console.error('登录过程中发生错误:', error);

    if (error.code === 'ECONNABORTED') {
      return res.status(500).json({ error: '微信API请求超时' });
    }

    if (error.response) {
      return res.status(500).json({
        error: '微信API调用失败',
        details: error.response.data
      });
    }

    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 获取用户信息
router.get('/user/:openid', async (req, res) => {
  const { openid } = req.params;

  try {
    const [users] = await pool.execute(
      'SELECT id, openid, nickName, avatarUrl, createdAt FROM users WHERE openid = ?',
      [openid]
    );

    if (users.length > 0) {
      res.json({ success: true, user: users[0] });
    } else {
      res.status(404).json({ error: '用户不存在' });
    }
  } catch (error) {
    console.error('Database error:', error);

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        error: '数据库连接超时',
        details: '无法连接到数据库服务器，请稍后重试',
        code: error.code
      });
    }

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({
        error: '数据库访问被拒绝',
        details: '数据库权限配置错误，请检查连接配置',
        code: error.code
      });
    }

    res.status(503).json({
      error: '数据库操作失败',
      details: '无法获取用户信息，请稍后重试',
      code: error.code
    });
  }
});

module.exports = router;
