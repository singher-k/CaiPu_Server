const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event

  console.log('=== 云函数获取用户信息 ===')
  console.log('userId:', userId)

  if (!userId) {
    return {
      success: false,
      message: '用户ID不能为空'
    }
  }

  try {
    const user = await db.collection('users').doc(userId).get()

    if (!user.data) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    return {
      success: true,
      user: {
        id: user.data._id,
        openid: user.data.openid,
        nickName: user.data.nickName,
        avatarUrl: user.data.avatarUrl,
        createdAt: user.data.createdAt
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
