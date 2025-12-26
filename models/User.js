const uuid = require('uuid');

class User {
  constructor(openid, nickName, avatarUrl, sessionKey) {
    this.id = uuid.v4();
    this.openid = openid;
    this.nickName = nickName;
    this.avatarUrl = avatarUrl;
    this.sessionKey = sessionKey;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = User;
