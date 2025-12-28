const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { recipeId } = event

  console.log('=== 获取菜谱详情 ===')
  console.log('recipeId:', recipeId)

  if (!recipeId) {
    return {
      success: false,
      message: '菜谱ID不能为空'
    }
  }

  try {
    const result = await db.collection('recipes').doc(recipeId).get()

    if (!result.data) {
      return {
        success: false,
        message: '菜谱不存在'
      }
    }

    return {
      success: true,
      recipe: {
        id: result.data._id,
        ...result.data
      }
    }
  } catch (error) {
    console.error('获取菜谱详情失败:', error)
    return {
      success: false,
      message: '获取菜谱详情失败',
      error: error.message
    }
  }
}
