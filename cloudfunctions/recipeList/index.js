const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  console.log('=== 获取所有菜谱 ===')

  try {
    const result = await db.collection('recipes')
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
    console.error('获取菜谱列表失败:', error)
    return {
      success: false,
      message: '获取菜谱列表失败',
      error: error.message
    }
  }
}
