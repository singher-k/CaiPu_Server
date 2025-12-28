const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { recipeId, title, image, category, difficulty, time, ingredients, steps } = event

  console.log('=== 更新菜谱 ===')
  console.log('recipeId:', recipeId)

  if (!recipeId) {
    return {
      success: false,
      message: '菜谱ID不能为空'
    }
  }

  try {
    const recipeDoc = await db.collection('recipes').doc(recipeId).get()

    if (!recipeDoc.data) {
      return {
        success: false,
        message: '菜谱不存在'
      }
    }

    const existingRecipe = recipeDoc.data
    const updateData = {
      updatedAt: new Date()
    }

    if (title !== undefined) updateData.title = title
    if (image !== undefined) updateData.image = image
    if (category !== undefined) updateData.category = category
    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (time !== undefined) updateData.time = time
    if (ingredients !== undefined) updateData.ingredients = ingredients
    if (steps !== undefined) updateData.steps = steps

    await db.collection('recipes').doc(recipeId).update({
      data: updateData
    })

    const updatedRecipe = await db.collection('recipes').doc(recipeId).get()

    console.log('菜谱更新成功')

    return {
      success: true,
      recipe: {
        id: updatedRecipe.data._id,
        ...updatedRecipe.data
      }
    }
  } catch (error) {
    console.error('更新菜谱失败:', error)
    return {
      success: false,
      message: '更新菜谱失败',
      error: error.message
    }
  }
}
