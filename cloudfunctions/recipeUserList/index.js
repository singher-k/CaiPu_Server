const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event

  console.log('=== 获取用户菜谱列表 ===')
  console.log('userId:', userId)

  if (!userId) {
    return {
      success: false,
      message: '用户ID不能为空'
    }
  }

  try {
    const result = await db.collection('recipes')
      .where({
        userId: userId
      })
      .orderBy('createdAt', 'desc')
      .get()

    const recipes = result.data.map(recipe => ({
      ...recipe,
      id: recipe._id
    }))

    return {
      success: true,
      recipes: recipes
    }
  } catch (error) {
    console.error('获取用户菜谱失败:', error)
    return {
      success: false,
      message: '获取用户菜谱失败',
      error: error.message
    }
  }
}
