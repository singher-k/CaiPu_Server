const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const User = require('../models/User');
const https = require('https');
const { URL } = require('url');

console.log('Auth路由模块加载');

// 微信API调用辅助函数
function getWxSession(code, wechatConfig) {
  return new Promise((resolve, reject) => {
    const wxUrl = new URL('https://api.weixin.qq.com/sns/jscode2session');
    wxUrl.searchParams.append('appid', wechatConfig.appid);
    wxUrl.searchParams.append('secret', wechatConfig.secret);
    wxUrl.searchParams.append('js_code', code);
    wxUrl.searchParams.append('grant_type', wechatConfig.grant_type);

    console.log('📞 微信API URL:', wxUrl.toString());

    const req = https.get(wxUrl.toString(), (res) => {
      console.log('📥 微信API响应状态:', res.statusCode);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('📄 微信API原始响应:', data);
        try {
          const parsed = JSON.parse(data);
          console.log('✅ 微信API响应解析成功:', parsed);
          resolve(parsed);
        } catch (e) {
          console.log('❌ 微信API响应解析失败:', e.message);
          reject(new Error('Invalid response from WeChat API: ' + e.message));
        }
      });
    });
    req.on('error', (error) => {
      console.log('❌ 微信API请求错误:', error.message);
      reject(error);
    });
    req.setTimeout(10000, () => {
      console.log('⏰ 微信API请求超时');
      req.destroy();
      reject(new Error('WeChat API request timeout'));
    });
  });
}

// 微信用户登录/注册
router.post('/login', async (req, res) => {
  console.log('=== 登录请求开始 ===');
  console.log('请求体:', JSON.stringify(req.body));

  try {
    const { code, nickName, avatarUrl } = req.body;

    // 参数验证
    if (!code) {
      console.log('❌ 错误: code参数为空');
      return res.status(400).json({
        success: false,
        message: '登录凭证code不能为空'
      });
    }

    // 模拟模式检查 - 如果code包含"mock"，则跳过微信API调用
    if (code.includes('mock')) {
      console.log('📦 使用模拟微信API响应 (测试模式)');
      const openid = 'mock_openid_' + Date.now();
      const session_key = 'mock_session_key_' + Date.now();

      console.log('📝 模拟数据库操作成功');

      return res.json({
        success: true,
        user: {
          id: 'temp-' + Date.now(),
          openid: openid,
          nickName: nickName || '微信用户',
          avatarUrl: avatarUrl || '',
          createdAt: new Date()
        },
        sessionKey: session_key,
        dbConnected: true,
        dbStatus: {
          connected: true,
          message: '模拟数据库连接成功'
        }
      });
    }

    // 真实微信登录流程
    const wechatConfig = {
      appid: process.env.WECHAT_APPID,
      secret: process.env.WECHAT_SECRET,
      grant_type: process.env.WECHAT_GRANT_TYPE || 'authorization_code'
    };

    // 检查微信配置
    if (!wechatConfig.appid || !wechatConfig.secret) {
      console.log('❌ 微信配置检查失败');
      return res.status(500).json({
        success: false,
        message: '微信配置错误，请检查环境变量中的WECHAT_APPID和WECHAT_SECRET'
      });
    }

    console.log('🔍 正在调用微信API获取用户信息...');

    // 调用微信API获取用户信息
    const wxData = await getWxSession(code, wechatConfig);

    const { openid, session_key, errcode, errmsg } = wxData;

    if (errcode) {
      console.error('微信API错误:', { errcode, errmsg });
      return res.status(400).json({
        success: false,
        message: '微信登录失败',
        error: errmsg,
        code: errcode
      });
    }

    if (!openid) {
      return res.status(400).json({
        success: false,
        message: '未能获取到用户openid'
      });
    }

    console.log('✅ 成功获取用户openid:', openid);

    // 处理用户数据
    let user = null;
    let dbConnected = true;

    try {
      // 查找现有用户
      const [existingUsers] = await pool.execute(
        'SELECT * FROM users WHERE wxId = ?',
        [openid]
      );

      if (existingUsers.length > 0) {
        // 更新用户信息
        console.log('📝 正在更新用户信息...');
        try {
          await pool.execute(
            'UPDATE users SET nickName = ?, avatarUrl = ?, sessionKey = ? WHERE wxId = ?',
            [nickName || existingUsers[0].nickName, avatarUrl || existingUsers[0].avatarUrl, session_key, openid]
          );

          // 获取更新后的用户信息
          const [updatedUsers] = await pool.execute(
            'SELECT * FROM users WHERE wxId = ?',
            [openid]
          );
          user = updatedUsers[0];

          console.log('✅ 用户信息已更新:', user.id);
        } catch (updateError) {
          console.error('❌ 更新用户信息失败:', updateError);
          // 如果更新失败，使用现有用户数据但更新session_key
          user = existingUsers[0];
          user.sessionKey = session_key;
        }
      } else {
        // 创建新用户
        console.log('🆕 正在创建新用户...');
        try {
          const newUser = new User(openid, nickName || '微信用户', avatarUrl);
          newUser.sessionKey = session_key;
          newUser.wxId = openid;

          await pool.execute(
            'INSERT INTO users (id, wxId, nickName, avatarUrl, sessionKey) VALUES (?, ?, ?, ?, ?)',
            [newUser.id, newUser.wxId, newUser.nickName, newUser.avatarUrl, newUser.sessionKey]
          );

          user = newUser;
          console.log('✅ 新用户创建成功:', user.id);
        } catch (createError) {
          console.error('❌ 创建新用户失败:', createError);
          // 如果创建失败，创建一个临时用户对象
          user = {
            id: 'temp-' + Date.now(),
            wxId: openid,
            nickName: nickName || '微信用户',
            avatarUrl: avatarUrl || '',
            sessionKey: session_key,
            createdAt: new Date()
          };
        }
      }
    } catch (dbError) {
      console.error('❌ 数据库操作失败:', dbError);
      dbConnected = false;

      // 创建临时用户对象，不依赖数据库
      user = {
        id: 'temp-' + Date.now(),
        wxId: openid,
        nickName: nickName || '微信用户',
        avatarUrl: avatarUrl || '',
        sessionKey: session_key,
        createdAt: new Date()
      };

      console.log('⚠️ 数据库不可用，创建临时用户对象');
    }

    // 返回成功响应
    const response = {
      success: true,
      user: {
        id: user.id,
        openid: user.wxId,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      sessionKey: session_key,
      dbConnected: dbConnected
    };

    // 如果数据库有问题，添加状态信息
    if (!dbConnected) {
      response.dbStatus = {
        connected: false,
        errorMessage: '数据库连接问题，但不影响登录功能'
      };
    }

    console.log('✅ 登录成功，返回用户信息');
    res.json(response);

  } catch (error) {
    console.error('登录过程中发生错误:', error);

    // 统一错误处理
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 获取用户信息
router.get('/user/:openid', async (req, res) => {
  const { openid } = req.params;

  try {
    const [users] = await pool.execute(
      'SELECT id, wxId, nickName, avatarUrl, createdAt FROM users WHERE wxId = ?',
      [openid]
    );

    if (users.length > 0) {
      const user = users[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          openid: user.wxId,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt
        }
      });
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

// 更新用户信息
router.post('/update', async (req, res) => {
  console.log('=== 更新用户信息请求开始 ===');
  console.log('请求URL:', req.method, req.url);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('原始请求体类型:', typeof req.body);
  console.log('原始请求体:', JSON.stringify(req.body, null, 2));
  console.log('userId值:', req.body.userId, '类型:', typeof req.body.userId);
  console.log('nickName值:', req.body.nickName, '类型:', typeof req.body.nickName);
  console.log('avatarUrl值:', req.body.avatarUrl, '类型:', typeof req.body.avatarUrl);

  try {
    const { userId, nickName, avatarUrl } = req.body;

    console.log('解析后的参数:', { userId, nickName, avatarUrl });

    // 参数验证
    if (!userId) {
      console.log('❌ 错误: userId参数为空');
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
    }

    if (!nickName && !avatarUrl) {
      console.log('❌ 错误: 没有提供要更新的信息');
      return res.status(400).json({
        success: false,
        message: '请提供要更新的用户信息'
      });
    }

    // 查找用户
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      console.log('❌ 错误: 用户不存在');
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];
    console.log('📋 找到用户:', user.id);

    // 构建更新字段和值
    const updateFields = [];
    const updateValues = [];

    if (nickName) {
      updateFields.push('nickName = ?');
      updateValues.push(nickName);
    }

    if (avatarUrl) {
      updateFields.push('avatarUrl = ?');
      updateValues.push(avatarUrl);
    }

    // 添加更新时间
    updateFields.push('updatedAt = ?');
    updateValues.push(new Date());

    // 添加WHERE条件
    updateValues.push(userId);

    // 执行更新
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log('📝 更新查询:', updateQuery);
    console.log('📊 更新值:', updateValues);

    await pool.execute(updateQuery, updateValues);

    console.log('✅ 用户信息更新成功');

    // 返回更新后的用户信息
    const updatedUser = {
      id: user.id,
      openid: user.wxId,
      nickName: nickName || user.nickName,
      avatarUrl: avatarUrl || user.avatarUrl,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: '用户信息更新成功',
      user: updatedUser
    });

  } catch (error) {
    console.error('更新用户信息失败:', error);

    // 数据库连接错误处理
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: '数据库连接超时，请稍后重试'
      });
    }

    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
});

module.exports = router;