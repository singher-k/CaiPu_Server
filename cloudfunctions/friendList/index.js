const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event

  console.log('=== 获取好友列表 ===')
  console.log('userId:', userId)

  if (!userId) {
    return {
      success: false,
      message: '用户ID不能为空'
    }
  }

  try {
    const friendships = await db.collection('friends')
      .where({
        userId: userId,
        status: 'accepted'
      })
      .get()

    const friends = []

    for (const fs of friendships.data) {
      const userDoc = await db.collection('users').doc(fs.friendId).get()
      if (userDoc.data) {
        friends.push({
          id: fs._id,
          friendId: fs.friendId,
          nickName: userDoc.data.nickName,
          avatarUrl: userDoc.data.avatarUrl,
          createdAt: fs.createdAt
        })
      }
    }

    console.log('获取好友列表成功:', friends.length)

    return {
      success: true,
      friends: friends
    }
  } catch (error) {
    console.error('获取好友列表失败:', error)
    return {
      success: false,
      message: '获取好友列表失败',
      error: error.message
    }
  }
}
