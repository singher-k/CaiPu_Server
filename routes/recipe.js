const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Recipe = require('../models/Recipe');

// 上传菜谱
router.post('/', async (req, res) => {
  const { title, image, category, difficulty, time, ingredients, steps, userId } = req.body;

  try {
    // 检查用户是否存在
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 创建新菜谱
    const recipe = new Recipe(title, image, category, difficulty, time, ingredients, steps, userId);

    await pool.execute(
      'INSERT INTO recipes (id, title, image, category, difficulty, time, ingredients, steps, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [recipe.id, recipe.title, recipe.image, recipe.category, recipe.difficulty, recipe.time, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.steps), recipe.userId]
    );

    res.json({ success: true, recipe });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 获取用户的所有菜谱
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [recipes] = await pool.execute(
      'SELECT * FROM recipes WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    // 解析JSON字段
    const parsedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      steps: JSON.parse(recipe.steps)
    }));

    res.json({ success: true, recipes: parsedRecipes });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 获取单个菜谱详情
router.get('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  try {
    const [recipes] = await pool.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ success: false, message: '菜谱不存在' });
    }

    // 解析JSON字段
    const recipe = {
      ...recipes[0],
      ingredients: JSON.parse(recipes[0].ingredients),
      steps: JSON.parse(recipes[0].steps)
    };

    res.json({ success: true, recipe });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 更新菜谱
router.put('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  const { title, image, category, difficulty, time, ingredients, steps } = req.body;

  try {
    // 检查菜谱是否存在
    const [existingRecipes] = await pool.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [recipeId]
    );

    if (existingRecipes.length === 0) {
      return res.status(404).json({ success: false, message: '菜谱不存在' });
    }

    const existingRecipe = existingRecipes[0];

    // 更新菜谱信息
    await pool.execute(
      'UPDATE recipes SET title = ?, image = ?, category = ?, difficulty = ?, time = ?, ingredients = ?, steps = ? WHERE id = ?',
      [
        title || existingRecipe.title,
        image || existingRecipe.image,
        category || existingRecipe.category,
        difficulty || existingRecipe.difficulty,
        time || existingRecipe.time,
        ingredients ? JSON.stringify(ingredients) : existingRecipe.ingredients,
        steps ? JSON.stringify(steps) : existingRecipe.steps,
        recipeId
      ]
    );

    // 获取更新后的菜谱信息
    const [updatedRecipes] = await pool.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [recipeId]
    );

    // 解析JSON字段
    const updatedRecipe = {
      ...updatedRecipes[0],
      ingredients: JSON.parse(updatedRecipes[0].ingredients),
      steps: JSON.parse(updatedRecipes[0].steps)
    };

    res.json({ success: true, recipe: updatedRecipe });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 删除菜谱
router.delete('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  try {
    // 检查菜谱是否存在
    const [existingRecipes] = await pool.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [recipeId]
    );

    if (existingRecipes.length === 0) {
      return res.status(404).json({ success: false, message: '菜谱不存在' });
    }

    await pool.execute(
      'DELETE FROM recipes WHERE id = ?',
      [recipeId]
    );

    res.json({ success: true, message: '菜谱删除成功' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

module.exports = router;