const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId, friendId, recipeId, message } = event

  console.log('=== 发送预约请求 ===')
  console.log('userId:', userId, 'friendId:', friendId, 'recipeId:', recipeId)

  if (!userId || !friendId || !recipeId) {
    return {
      success: false,
      message: '用户ID、好友ID和菜谱ID不能为空'
    }
  }

  try {
    const [userRes, friendRes, recipeRes] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(friendId).get(),
      db.collection('recipes').doc(recipeId).get()
    ])

    if (!userRes.data) {
      return { success: false, message: '用户不存在' }
    }

    if (!friendRes.data) {
      return { success: false, message: '好友不存在' }
    }

    if (!recipeRes.data) {
      return { success: false, message: '菜谱不存在' }
    }

    const friendships = await db.collection('friends').where({
      _or: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ],
      status: 'accepted'
    }).get()

    if (friendships.data.length === 0) {
      return { success: false, message: '只有好友才能发送预约请求' }
    }

    const newReservation = {
      userId: userId,
      friendId: friendId,
      recipeId: recipeId,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('reservations').add({
      data: newReservation
    })

    console.log('预约请求发送成功:', result._id)

    return {
      success: true,
      reservation: {
        id: result._id,
        ...newReservation
      }
    }
  } catch (error) {
    console.error('发送预约请求失败:', error)
    return {
      success: false,
      message: '发送预约请求失败',
      error: error.message
    }
  }
}
