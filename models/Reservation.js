const uuid = require('uuid');

class Reservation {
  constructor(userId, friendId, recipeId, message) {
    this.id = uuid.v4();
    this.userId = userId;
    this.friendId = friendId;
    this.recipeId = recipeId;
    this.message = message;
    this.status = 'pending'; // pending, approved, rejected
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Reservation;
