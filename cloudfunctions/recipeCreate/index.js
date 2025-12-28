const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { title, image, category, difficulty, time, ingredients, steps, userId } = event

  console.log('=== 创建菜谱 ===')
  console.log('openid:', wxContext.OPENID)
  console.log('title:', title)

  if (!title || !userId) {
    return {
      success: false,
      message: '标题和用户ID不能为空'
    }
  }

  try {
    const users = await db.collection('users').where({
      _id: userId
    }).get()

    if (users.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const newRecipe = {
      title,
      image: image || '',
      category: category || '',
      difficulty: difficulty || '',
      time: time || '',
      ingredients: ingredients || [],
      steps: steps || [],
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('recipes').add({
      data: newRecipe
    })

    console.log('菜谱创建成功:', result._id)

    return {
      success: true,
      recipe: {
        id: result._id,
        ...newRecipe
      }
    }
  } catch (error) {
    console.error('创建菜谱失败:', error)
    return {
      success: false,
      message: '创建菜谱失败',
      error: error.message
    }
  }
}
