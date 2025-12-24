const uuid = require('uuid');

class Friend {
  constructor(userId, friendId) {
    this.id = uuid.v4();
    this.userId = userId;
    this.friendId = friendId;
    this.status = 'pending'; // pending, accepted, rejected
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Friend;
