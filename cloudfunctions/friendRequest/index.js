const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId, friendId } = event

  console.log('=== 发送好友请求 ===')
  console.log('userId:', userId, 'friendId:', friendId)

  if (!userId || !friendId) {
    return {
      success: false,
      message: '用户ID和好友ID不能为空'
    }
  }

  if (userId === friendId) {
    return {
      success: false,
      message: '不能添加自己为好友'
    }
  }

  try {
    const [userRes, friendRes] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(friendId).get()
    ])

    if (!userRes.data) {
      return { success: false, message: '用户不存在' }
    }

    if (!friendRes.data) {
      return { success: false, message: '好友不存在' }
    }

    const existingFriendships = await db.collection('friends').where({
      _or: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ]
    }).get()

    if (existingFriendships.data.length > 0) {
      return { success: false, message: '好友关系已存在或请求已发送' }
    }

    const newFriendship = {
      userId: userId,
      friendId: friendId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('friends').add({
      data: newFriendship
    })

    console.log('好友请求发送成功:', result._id)

    return {
      success: true,
      friendRequest: {
        id: result._id,
        ...newFriendship
      }
    }
  } catch (error) {
    console.error('发送好友请求失败:', error)
    return {
      success: false,
      message: '发送好友请求失败',
      error: error.message
    }
  }
}
