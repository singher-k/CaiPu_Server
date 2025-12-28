const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId, friendId } = event

  console.log('=== 移除好友 ===')
  console.log('userId:', userId, 'friendId:', friendId)

  if (!userId || !friendId) {
    return {
      success: false,
      message: '用户ID和好友ID不能为空'
    }
  }

  try {
    await db.collection('friends').where({
      _or: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ]
    }).remove()

    console.log('好友移除成功')

    return {
      success: true,
      message: '好友已移除'
    }
  } catch (error) {
    console.error('移除好友失败:', error)
    return {
      success: false,
      message: '移除好友失败',
      error: error.message
    }
  }
}
