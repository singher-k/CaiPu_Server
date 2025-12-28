const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { recipeId } = event

  console.log('=== 删除菜谱 ===')
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

    await db.collection('recipes').doc(recipeId).remove()

    console.log('菜谱删除成功')

    return {
      success: true,
      message: '菜谱删除成功'
    }
  } catch (error) {
    console.error('删除菜谱失败:', error)
    return {
      success: false,
      message: '删除菜谱失败',
      error: error.message
    }
  }
}
