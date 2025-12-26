const express = require('express');
const router = express.Router();

console.log('Auth路由模块加载');

// 简单的测试路由
router.get('/test', (req, res) => {
  console.log('测试路由被调用');
  res.json({ message: 'Auth test route works', timestamp: new Date().toISOString() });
});

// 登录路由（简化版）
router.post('/login', (req, res) => {
  console.log('=== 简化登录请求开始 ===');
  console.log('请求体:', JSON.stringify(req.body));
  
  const { code, nickName, avatarUrl } = req.body;
  
  if (!code) {
    console.log('错误: code参数为空');
    return res.status(400).json({ error: '登录凭证code不能为空' });
  }
  
  console.log('成功收到登录请求，code:', code);
  
  // 模拟微信API响应
  const mockWxResponse = {
    openid: 'test_openid_' + Date.now(),
    session_key: 'test_session_key_' + Date.now(),
    errcode: 0,
    errmsg: 'ok'
  };
  
  const { openid, session_key, errcode, errmsg } = mockWxResponse;
  
  if (errcode) {
    console.log('微信API错误:', { errcode, errmsg });
    return res.status(400).json({
      error: '微信登录失败',
      details: errmsg,
      code: errcode
    });
  }
  
  console.log('成功获取用户openid:', openid);
  
  // 模拟用户信息
  const user = {
    id: 'user_' + Date.now(),
    openid: openid,
    nickName: nickName || '微信用户',
    avatarUrl: avatarUrl || 'https://example.com/avatar.jpg',
    createdAt: new Date().toISOString()
  };
  
  console.log('返回用户信息:', user);
  
  res.json({
    success: true,
    user: user,
    sessionKey: session_key
  });
});

module.exports = router;