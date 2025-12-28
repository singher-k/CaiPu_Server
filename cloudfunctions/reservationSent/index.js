const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event

  console.log('=== 获取发送的预约请求 ===')
  console.log('userId:', userId)

  if (!userId) {
    return {
      success: false,
      message: '用户ID不能为空'
    }
  }

  try {
    const result = await db.collection('reservations')
      .where({
        userId: userId
      })
      .orderBy('createdAt', 'desc')
      .get()

    const reservationsWithDetails = []

    for (const r of result.data) {
      const [friendDoc, recipeDoc] = await Promise.all([
        db.collection('users').doc(r.friendId).get(),
        db.collection('recipes').doc(r.recipeId).get()
      ])

      reservationsWithDetails.push({
        id: r._id,
        userId: r.userId,
        friendId: r.friendId,
        recipeId: r.recipeId,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
        friend: friendDoc.data ? {
          id: friendDoc.data._id,
          nickName: friendDoc.data.nickName,
          avatarUrl: friendDoc.data.avatarUrl
        } : null,
        recipe: recipeDoc.data ? {
          id: recipeDoc.data._id,
          title: recipeDoc.data.title,
          image: recipeDoc.data.image
        } : null
      })
    }

    console.log('获取发送的预约请求成功:', reservationsWithDetails.length)

    return {
      success: true,
      reservations: reservationsWithDetails
    }
  } catch (error) {
    console.error('获取发送的预约请求失败:', error)
    return {
      success: false,
      message: '获取预约请求失败',
      error: error.message
    }
  }
}
