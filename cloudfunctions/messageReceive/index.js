const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const message = event.message

  console.log('=== 接收服务端消息 ===')
  console.log('message:', message)

  try {
    console.log('消息已接收:', message)

    return {
      success: true,
      message: '消息已接收',
      receivedMessage: message
    }
  } catch (error) {
    console.error('接收消息失败:', error)
    return {
      success: false,
      message: '接收消息失败',
      error: error.message
    }
  }
}
