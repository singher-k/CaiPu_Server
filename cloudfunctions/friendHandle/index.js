const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { requestId, action } = event

  console.log('=== 处理好友请求 ===')
  console.log('requestId:', requestId, 'action:', action)

  if (!requestId || !action) {
    return {
      success: false,
      message: '请求ID和操作不能为空'
    }
  }

  if (!['accept', 'reject'].includes(action)) {
    return {
      success: false,
      message: '无效的操作'
    }
  }

  try {
    const requestDoc = await db.collection('friends').doc(requestId).get()

    if (!requestDoc.data) {
      return {
        success: false,
        message: '好友请求不存在'
      }
    }

    const friendRequest = requestDoc.data

    if (action === 'accept') {
      await db.collection('friends').doc(requestId).update({
        data: {
          status: 'accepted',
          updatedAt: new Date()
        }
      })

      const reverseFriendship = {
        userId: friendRequest.friendId,
        friendId: friendRequest.userId,
        status: 'accepted',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('friends').add({
        data: reverseFriendship
      })

      console.log('好友请求已接受')

      return {
        success: true,
        message: '好友请求已接受',
        friendRequest: { ...friendRequest, status: 'accepted' }
      }
    } else {
      await db.collection('friends').doc(requestId).update({
        data: {
          status: 'rejected',
          updatedAt: new Date()
        }
      })

      console.log('好友请求已拒绝')

      return {
        success: true,
        message: '好友请求已拒绝',
        friendRequest: { ...friendRequest, status: 'rejected' }
      }
    }
  } catch (error) {
    console.error('处理好友请求失败:', error)
    return {
      success: false,
      message: '处理好友请求失败',
      error: error.message
    }
  }
}
