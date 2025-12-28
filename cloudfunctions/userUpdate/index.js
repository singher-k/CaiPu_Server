const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId, nickName, avatarUrl } = event

  console.log('=== 云函数用户更新请求 ===')
  console.log('openid:', wxContext.OPENID)
  console.log('userId:', userId)
  console.log('nickName:', nickName)
  console.log('avatarUrl:', avatarUrl)

  // 参数验证
  if (!userId) {
    return {
      success: false,
      message: '用户ID不能为空'
    }
  }

  if (!nickName && !avatarUrl) {
    return {
      success: false,
      message: '请提供要更新的用户信息'
    }
  }

  try {
    // 查询用户
    const users = await db.collection('users').where({
      _id: userId
    }).get()

    if (users.data.length === 0) {
      console.log('用户不存在:', userId)
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = users.data[0]
    console.log('找到用户:', user._id)

    // 构建更新数据
    const updateData = {
      updatedAt: new Date()
    }

    if (nickName) {
      updateData.nickName = nickName
    }

    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl
    }

    // 执行更新
    await db.collection('users').doc(userId).update({
      data: updateData
    })

    console.log('用户信息更新成功')

    // 获取更新后的用户信息
    const updatedUser = await db.collection('users').doc(userId).get()

    return {
      success: true,
      message: '用户信息更新成功',
      user: {
        id: updatedUser.data._id,
        openid: updatedUser.data.openid,
        nickName: updatedUser.data.nickName,
        avatarUrl: updatedUser.data.avatarUrl,
        createdAt: updatedUser.data.createdAt
      }
    }

  } catch (error) {
    console.error('更新用户信息失败:', error)
    return {
      success: false,
      message: '更新用户信息失败',
      error: error.message
    }
  }
}
