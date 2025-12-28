const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { openid } = event

  console.log('=== 云函数获取用户详情 ===')
  console.log('openid:', openid || wxContext.OPENID)

  const userOpenid = openid || wxContext.OPENID

  if (!userOpenid) {
    return {
      success: false,
      message: '用户openid不能为空'
    }
  }

  try {
    const users = await db.collection('users').where({
      openid: userOpenid
    }).get()

    if (users.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = users.data[0]

    return {
      success: true,
      user: {
        id: user._id,
        openid: user.openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    }

  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      message: '获取用户信息失败',
      error: error.message
    }
  }
}
