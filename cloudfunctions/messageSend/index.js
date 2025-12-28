const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { fromUserId, toUserId, content, type } = event

  console.log('=== 发送消息 ===')
  console.log('fromUserId:', fromUserId, 'toUserId:', toUserId)

  if (!fromUserId || !toUserId || !content) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }

  try {
    const [fromUser, toUser] = await Promise.all([
      db.collection('users').doc(fromUserId).get(),
      db.collection('users').doc(toUserId).get()
    ])

    if (!fromUser.data) {
      return { success: false, message: '发送用户不存在' }
    }

    if (!toUser.data) {
      return { success: false, message: '接收用户不存在' }
    }

    const newMessage = {
      fromUserId: fromUserId,
      toUserId: toUserId,
      content: content,
      type: type || 'text',
      status: 'sent',
      createdAt: new Date()
    }

    const result = await db.collection('messages').add({
      data: newMessage
    })

    console.log('消息发送成功:', result._id)

    return {
      success: true,
      message: {
        id: result._id,
        ...newMessage
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    return {
      success: false,
      message: '发送消息失败',
      error: error.message
    }
  }
}
