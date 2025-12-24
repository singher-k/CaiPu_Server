const uuid = require('uuid');

class User {
  constructor(wxId, nickName, avatarUrl) {
    this.id = uuid.v4();
    this.wxId = wxId;
    this.nickName = nickName;
    this.avatarUrl = avatarUrl;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = User;
