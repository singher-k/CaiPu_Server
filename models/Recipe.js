const uuid = require('uuid');

class Recipe {
  constructor(title, image, category, difficulty, time, ingredients, steps, userId) {
    this.id = uuid.v4();
    this.title = title;
    this.image = image;
    this.category = category;
    this.difficulty = difficulty;
    this.time = time;
    this.ingredients = ingredients;
    this.steps = steps;
    this.userId = userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Recipe;