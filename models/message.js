const { v4: uuidv4 } = require('uuid');

class Message {
  constructor(fromUserId, toUserId, content, type) {
    this.id = uuidv4();
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.content = content;
    this.type = type || 'text'; // 默认文本类型
    this.status = 'sent'; // sent, delivered, read
    this.createdAt = new Date();
  }
}

module.exports = Message;
