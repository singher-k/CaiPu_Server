const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const User = require('../models/User');
const https = require('https');
const { URL } = require('url');

console.log('Auth路由模块加载');

// 微信用户登录/注册
router.post('/login', async (req, res) => {
  console.log('=== 登录请求开始 ===');
  console.log('请求体:', JSON.stringify(req.body));

  const { code, nickName, avatarUrl } = req.body;
  console.log('提取的参数:', { code, nickName, avatarUrl });

  // 模拟模式检查 - 如果code包含"mock"，则跳过微信API调用
  if (code.includes('mock')) {
    console.log('📦 使用模拟微信API响应 (测试模式)');
    const openid = 'mock_openid_' + Date.now();
    const session_key = 'mock_session_key_' + Date.now();

    console.log('成功获取用户openid:', openid);

    // 模拟数据库操作 - 强制模拟数据库连接失败
    let user = null;
    let dbConnected = true;
    let dbErrorType = null;
    let dbErrorMessage = null;

    console.log('🔍 正在查找现有用户...');
    console.log('🆕 正在创建新用户...');
    console.log('❌ 创建新用户失败: ETIMEDOUT');

    dbConnected = false;
    dbErrorType = 'ETIMEDOUT';
    dbErrorMessage = '无法连接到数据库服务器，请稍后重试';

    // 创建临时用户对象
    user = {
      id: 'temp-' + Date.now(),
      openid: openid,
      nickName: nickName || '微信用户',
      avatarUrl: avatarUrl || '',
      sessionKey: session_key,
      createdAt: new Date()
    };

    console.log('⚠️ 数据库不可用，创建临时用户对象');

    // 返回用户信息和登录成功标识
    const response = {
      success: true,
      user: {
        id: user.id,
        openid: user.openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      sessionKey: session_key,
      dbConnected: dbConnected
    };

    // 添加数据库错误信息
    response.dbStatus = {
      connected: false,
      errorType: dbErrorType,
      errorMessage: dbErrorMessage
    };

    // 返回503表明服务暂时不可用
    console.log('⚠️ 数据库连接问题，返回503状态码');
    return res.status(503).json(response);
  }

  if (!code) {
    console.log('❌ 错误: code参数为空');
    return res.status(400).json({ error: '登录凭证code不能为空' });
  }

  try {
    console.log('✅ 进入try块');
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

    // 检查微信配置，但允许模拟代码绕过检查
    if (!code.includes('mock') && (!wechatConfig.appid || !wechatConfig.secret || wechatConfig.appid === 'your_appid_here')) {
      console.log('❌ 微信配置检查失败');
      return res.status(500).json({ error: '微信配置错误，请检查环境变量中的WECHAT_APPID和WECHAT_SECRET' });
    }

    console.log('🔍 正在调用微信API获取用户信息...');

    // 模拟微信API响应，用于测试数据库错误处理
    const wxResponse = new Promise((resolve, reject) => {
      // 如果code包含"mock"字符串，则返回模拟成功响应
      if (code.includes('mock')) {
        console.log('📦 使用模拟微信API响应 (测试模式)');
        setTimeout(() => {
          resolve({
            openid: 'mock_openid_' + Date.now(),
            session_key: 'mock_session_key_' + Date.now()
          });
        }, 500); // 模拟网络延迟
      } else {
        // 正常调用微信API
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
      }
    });

    const wxData = await wxResponse;

    const { openid, session_key, errcode, errmsg } = wxData;

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
    let user = null;
    let dbConnected = true;
    let dbErrorType = null;
    let dbErrorMessage = null;

    try {
      console.log('🔍 正在查找现有用户...');
      const [existingUsers] = await pool.execute(
        'SELECT * FROM users WHERE openid = ?',
        [openid]
      );

      if (existingUsers.length > 0) {
        // 更新用户信息
        console.log('📝 正在更新用户信息...');
        try {
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

          console.log('✅ 用户信息已更新:', user.id);
        } catch (updateError) {
          console.error('❌ 更新用户信息失败:', updateError);
          dbConnected = false;
          dbErrorType = updateError.code;
          dbErrorMessage = updateError.message;

          // 如果更新失败，使用现有用户数据（但会更新session_key）
          user = existingUsers[0];
          user.sessionKey = session_key;
        }
      } else {
        // 创建新用户
        console.log('🆕 正在创建新用户...');
        try {
          const newUser = new User(openid, nickName || '微信用户', avatarUrl);
          newUser.sessionKey = session_key;
          newUser.openid = openid;

          await pool.execute(
            'INSERT INTO users (id, openid, nickName, avatarUrl, sessionKey) VALUES (?, ?, ?, ?, ?)',
            [newUser.id, newUser.openid, newUser.nickName, newUser.avatarUrl, newUser.sessionKey]
          );

          user = newUser;
          console.log('✅ 新用户创建成功:', user.id);
        } catch (createError) {
          console.error('❌ 创建新用户失败:', createError);
          dbConnected = false;
          dbErrorType = createError.code;
          dbErrorMessage = createError.message;

          // 如果创建失败，创建一个临时用户对象
          user = {
            id: 'temp-' + Date.now(),
            openid: openid,
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
      dbErrorType = dbError.code;
      dbErrorMessage = dbError.message;

      // 创建临时用户对象，不依赖数据库
      user = {
        id: 'temp-' + Date.now(),
        openid: openid,
        nickName: nickName || '微信用户',
        avatarUrl: avatarUrl || '',
        sessionKey: session_key,
        createdAt: new Date()
      };

      console.log('⚠️ 数据库不可用，创建临时用户对象');
    }

    // 3. 返回用户信息和登录成功标识
    const response = {
      success: true,
      user: {
        id: user.id,
        openid: user.openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      sessionKey: session_key,
      dbConnected: dbConnected
    };

    // 如果数据库有问题，添加额外的错误信息
    if (!dbConnected) {
      response.dbStatus = {
        connected: false,
        errorType: dbErrorType,
        errorMessage: dbErrorMessage
      };

      // 返回503而不是200，表明服务暂时不可用
      console.log('⚠️ 数据库连接问题，返回503状态码');
      return res.status(503).json(response);
    }

    console.log('✅ 登录成功，返回用户信息');
    res.json(response);

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