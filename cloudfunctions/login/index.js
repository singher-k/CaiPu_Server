const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code, nickName, avatarUrl } = event

  console.log('=== 云函数登录请求 ===')
  console.log('openid:', wxContext.OPENID)
  console.log('code:', code)
  console.log('nickName:', nickName)
  console.log('avatarUrl:', avatarUrl)

  if (!code) {
    return {
      success: false,
      message: '登录凭证code不能为空'
    }
  }

  try {
    // 调用微信登录凭证校验接口
    const loginResult = await cloud.login({
      query: 'code=' + code
    })

    console.log('微信登录结果:', loginResult)

    const openid = wxContext.OPENID

    if (!openid) {
      return {
        success: false,
        message: '未能获取到用户openid'
      }
    }

    // 查询用户是否已存在
    const users = await db.collection('users').where({
      openid: openid
    }).get()

    let user = null

    if (users.data.length > 0) {
      // 用户已存在，更新信息
      user = users.data[0]
      await db.collection('users').doc(user._id).update({
        data: {
          nickName: nickName || user.nickName,
          avatarUrl: avatarUrl || user.avatarUrl,
          updatedAt: new Date()
        }
      })
      console.log('用户信息已更新:', user._id)
    } else {
      // 新用户，创建记录
      const newUser = {
        openid: openid,
        nickName: nickName || '微信用户',
        avatarUrl: avatarUrl || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const addResult = await db.collection('users').add({
        data: newUser
      })

      user = {
        ...newUser,
        _id: addResult._id
      }
      console.log('新用户创建成功:', user._id)
    }

    return {
      success: true,
      user: {
        id: user._id,
        openid: user.openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    }

  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      message: '登录失败',
      error: error.message
    }
  }
}
