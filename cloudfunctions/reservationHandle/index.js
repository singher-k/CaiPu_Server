const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { reservationId, action } = event

  console.log('=== 处理预约请求 ===')
  console.log('reservationId:', reservationId, 'action:', action)

  if (!reservationId || !action) {
    return {
      success: false,
      message: '预约ID和操作不能为空'
    }
  }

  if (!['approve', 'reject'].includes(action)) {
    return {
      success: false,
      message: '无效的操作'
    }
  }

  try {
    const reservationDoc = await db.collection('reservations').doc(reservationId).get()

    if (!reservationDoc.data) {
      return {
        success: false,
        message: '预约记录不存在'
      }
    }

    let feedback = ''
    let newStatus = ''

    if (action === 'approve') {
      newStatus = 'approved'
      feedback = '再忍五分钟就能开荤啦'
    } else {
      newStatus = 'rejected'
      feedback = '你吃个铲铲你吃'
    }

    await db.collection('reservations').doc(reservationId).update({
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    })

    const updatedReservation = await db.collection('reservations').doc(reservationId).get()

    console.log('预约请求处理成功')

    return {
      success: true,
      reservation: {
        id: updatedReservation.data._id,
        ...updatedReservation.data
      },
      feedback: feedback
    }
  } catch (error) {
    console.error('处理预约请求失败:', error)
    return {
      success: false,
      message: '处理预约请求失败',
      error: error.message
    }
  }
}
