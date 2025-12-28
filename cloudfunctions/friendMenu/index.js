const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { friendId } = event

  console.log('=== 获取好友菜谱 ===')
  console.log('friendId:', friendId)

  if (!friendId) {
    return {
      success: false,
      message: '好友ID不能为空'
    }
  }

  try {
    const result = await db.collection('recipes')
      .where({
        userId: friendId
      })
      .orderBy('createdAt', 'desc')
      .get()

    const recipes = result.data.map(recipe => ({
      ...recipe,
      id: recipe._id
    }))

    console.log('获取好友菜谱成功:', recipes.length)

    return {
      success: true,
      recipes: recipes
    }
  } catch (error) {
    console.error('获取好友菜谱失败:', error)
    return {
      success: false,
      message: '获取好友菜谱失败',
      error: error.message
    }
  }
}
