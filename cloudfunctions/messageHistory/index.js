const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { userId, friendId, limit = 20, offset = 0 } = event

  console.log('=== 获取历史消息 ===')
  console.log('userId:', userId, 'friendId:', friendId)

  if (!userId || !friendId) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }

  try {
    const result = await db.collection('messages')
      .where({
        _or: [
          { fromUserId: userId, toUserId: friendId },
          { fromUserId: friendId, toUserId: userId }
        ]
      })
      .orderBy('createdAt', 'desc')
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .get()

    const messages = result.data.map(msg => ({
      ...msg,
      id: msg._id
    })).reverse()

    console.log('获取历史消息成功:', messages.length)

    return {
      success: true,
      messages: messages
    }
  } catch (error) {
    console.error('获取历史消息失败:', error)
    return {
      success: false,
      message: '获取历史消息失败',
      error: error.message
    }
  }
}
