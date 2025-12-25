# 菜谱分享系统 API 文档

## 认证相关 API (/api/auth)

### 微信用户登录/注册
- **请求方法**: POST
- **请求路径**: `/api/auth/login`
- **功能**: 用户登录或注册微信账号
- **请求参数** (body):
  ```json
  {
    "wxId": "微信用户ID",
    "nickName": "用户昵称",
    "avatarUrl": "头像URL"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "user": {
      "id": "用户ID",
      "wxId": "微信用户ID",
      "nickName": "用户昵称",
      "avatarUrl": "头像URL",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  }
  ```
- **状态码**:
  - 200: 登录/注册成功
  - 400: 微信ID不能为空
  - 500: 数据库错误

### 获取用户信息
- **请求方法**: GET
- **请求路径**: `/api/auth/user/:wxId`
- **功能**: 根据微信ID获取用户信息
- **路径参数**:
  - `wxId`: 微信用户ID
- **响应示例**:
  ```json
  {
    "success": true,
    "user": {
      "id": "用户ID",
      "wxId": "微信用户ID",
      "nickName": "用户昵称",
      "avatarUrl": "头像URL"
    }
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 404: 用户不存在
  - 500: 数据库错误

## 菜谱相关 API (/api/recipes)

### 上传菜谱
- **请求方法**: POST
- **请求路径**: `/api/recipes`
- **功能**: 用户上传新菜谱
- **请求参数** (body):
  ```json
  {
    "title": "菜谱标题",
    "image": "菜谱图片URL",
    "category": "菜谱分类",
    "difficulty": "难度等级",
    "time": "烹饪时间",
    "ingredients": ["食材1", "食材2"],
    "steps": ["步骤1", "步骤2"],
    "userId": "用户ID"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "recipe": {
      "id": "菜谱ID",
      "title": "菜谱标题",
      "image": "菜谱图片URL",
      "category": "菜谱分类",
      "difficulty": "难度等级",
      "time": "烹饪时间",
      "ingredients": ["食材1", "食材2"],
      "steps": ["步骤1", "步骤2"],
      "userId": "用户ID",
      "createdAt": "创建时间"
    }
  }
  ```
- **状态码**:
  - 200: 上传成功
  - 404: 用户不存在
  - 500: 数据库错误

### 获取所有菜谱
- **请求方法**: GET
- **请求路径**: `/api/recipes`
- **功能**: 获取所有用户的菜谱列表
- **响应示例**:
  ```json
  {
    "success": true,
    "recipes": [
      {
        "id": "菜谱ID",
        "title": "菜谱标题",
        "image": "菜谱图片URL",
        "category": "菜谱分类",
        "difficulty": "难度等级",
        "time": "烹饪时间",
        "ingredients": ["食材1", "食材2"],
        "steps": ["步骤1", "步骤2"],
        "userId": "用户ID",
        "createdAt": "创建时间",
        "nickName": "作者昵称",
        "avatarUrl": "作者头像URL"
      }
    ]
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 500: 数据库错误

### 获取用户所有菜谱
- **请求方法**: GET
- **请求路径**: `/api/recipes/user/:userId`
- **功能**: 获取指定用户的所有菜谱
- **路径参数**:
  - `userId`: 用户ID
- **响应示例**:
  ```json
  {
    "success": true,
    "recipes": [
      {
        "id": "菜谱ID",
        "title": "菜谱标题",
        "image": "菜谱图片URL",
        "category": "菜谱分类",
        "difficulty": "难度等级",
        "time": "烹饪时间",
        "ingredients": ["食材1", "食材2"],
        "steps": ["步骤1", "步骤2"],
        "userId": "用户ID",
        "createdAt": "创建时间"
      }
    ]
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 500: 数据库错误

### 获取单个菜谱详情
- **请求方法**: GET
- **请求路径**: `/api/recipes/:recipeId`
- **功能**: 获取单个菜谱的详细信息
- **路径参数**:
  - `recipeId`: 菜谱ID
- **响应示例**:
  ```json
  {
    "success": true,
    "recipe": {
      "id": "菜谱ID",
      "title": "菜谱标题",
      "image": "菜谱图片URL",
      "category": "菜谱分类",
      "difficulty": "难度等级",
      "time": "烹饪时间",
      "ingredients": ["食材1", "食材2"],
      "steps": ["步骤1", "步骤2"],
      "userId": "用户ID",
      "createdAt": "创建时间"
    }
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 404: 菜谱不存在
  - 500: 数据库错误

### 更新菜谱
- **请求方法**: PUT
- **请求路径**: `/api/recipes/:recipeId`
- **功能**: 更新指定菜谱的信息
- **路径参数**:
  - `recipeId`: 菜谱ID
- **请求参数** (body):
  ```json
  {
    "title": "新菜谱标题",
    "image": "新菜谱图片URL",
    "category": "新分类",
    "difficulty": "新难度",
    "time": "新时间",
    "ingredients": ["新食材1", "新食材2"],
    "steps": ["新步骤1", "新步骤2"]
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "recipe": {
      "id": "菜谱ID",
      "title": "新菜谱标题",
      "image": "新菜谱图片URL",
      "category": "新分类",
      "difficulty": "新难度",
      "time": "新时间",
      "ingredients": ["新食材1", "新食材2"],
      "steps": ["新步骤1", "新步骤2"],
      "userId": "用户ID",
      "updatedAt": "更新时间"
    }
  }
  ```
- **状态码**:
  - 200: 更新成功
  - 404: 菜谱不存在
  - 500: 数据库错误

### 删除菜谱
- **请求方法**: DELETE
- **请求路径**: `/api/recipes/:recipeId`
- **功能**: 删除指定菜谱
- **路径参数**:
  - `recipeId`: 菜谱ID
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "菜谱删除成功"
  }
  ```
- **状态码**:
  - 200: 删除成功
  - 404: 菜谱不存在
  - 500: 数据库错误

## 好友相关 API (/api/friends)

### 发送好友请求
- **请求方法**: POST
- **请求路径**: `/api/friends/request`
- **功能**: 向其他用户发送好友请求
- **请求参数** (body):
  ```json
  {
    "userId": "发送请求用户ID",
    "friendId": "接收请求用户ID"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "friendRequest": {
      "id": "请求ID",
      "userId": "发送请求用户ID",
      "friendId": "接收请求用户ID",
      "status": "pending",
      "createdAt": "创建时间"
    }
  }
  ```
- **状态码**:
  - 200: 请求发送成功
  - 400: 好友关系已存在或请求已发送
  - 404: 用户或好友不存在
  - 500: 数据库错误

### 处理好友请求
- **请求方法**: POST
- **请求路径**: `/api/friends/handle/:requestId`
- **功能**: 接受或拒绝好友请求
- **路径参数**:
  - `requestId`: 好友请求ID
- **请求参数** (body):
  ```json
  {
    "action": "accept" // accept 或 reject
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "好友请求已接受",
    "friendRequest": {
      "id": "请求ID",
      "userId": "发送请求用户ID",
      "friendId": "接收请求用户ID",
      "status": "accepted",
      "createdAt": "创建时间"
    }
  }
  ```
- **状态码**:
  - 200: 处理成功
  - 400: 无效的操作
  - 404: 好友请求不存在
  - 500: 数据库错误

### 获取用户好友列表
- **请求方法**: GET
- **请求路径**: `/api/friends/list/:userId`
- **功能**: 获取用户的所有好友
- **路径参数**:
  - `userId`: 用户ID
- **响应示例**:
  ```json
  {
    "success": true,
    "friends": [
      {
        "id": "好友关系ID",
        "friendId": "好友ID",
        "nickName": "好友昵称",
        "avatarUrl": "好友头像URL",
        "createdAt": "成为好友时间"
      }
    ]
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 500: 数据库错误

### 移除好友
- **请求方法**: DELETE
- **请求路径**: `/api/friends/remove/:userId/:friendId`
- **功能**: 移除指定好友
- **路径参数**:
  - `userId`: 用户ID
  - `friendId`: 好友ID
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "好友已移除"
  }
  ```
- **状态码**:
  - 200: 移除成功
  - 500: 数据库错误

### 获取好友菜单
- **请求方法**: GET
- **请求路径**: `/api/friends/menu/:friendId`
- **功能**: 获取指定好友的所有菜谱
- **路径参数**:
  - `friendId`: 好友ID
- **响应示例**:
  ```json
  {
    "success": true,
    "recipes": [
      {
        "id": "菜谱ID",
        "title": "菜谱标题",
        "image": "菜谱图片URL",
        "category": "菜谱分类",
        "difficulty": "难度等级",
        "time": "烹饪时间",
        "ingredients": ["食材1", "食材2"],
        "steps": ["步骤1", "步骤2"],
        "userId": "好友ID",
        "createdAt": "创建时间"
      }
    ]
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 500: 数据库错误

## 预约相关 API (/api/reservations)

### 发送预约请求
- **请求方法**: POST
- **请求路径**: `/api/reservations`
- **功能**: 向好友发送菜谱预约请求
- **请求参数** (body):
  ```json
  {
    "userId": "发送请求用户ID",
    "friendId": "接收请求用户ID",
    "recipeId": "菜谱ID",
    "message": "预约留言"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "reservation": {
      "id": "预约ID",
      "userId": "发送请求用户ID",
      "friendId": "接收请求用户ID",
      "recipeId": "菜谱ID",
      "message": "预约留言",
      "status": "pending",
      "createdAt": "创建时间"
    }
  }
  ```
- **状态码**:
  - 200: 请求发送成功
  - 400: 只有好友才能发送预约请求
  - 404: 用户、好友或菜谱不存在
  - 500: 数据库错误

### 处理预约请求
- **请求方法**: POST
- **请求路径**: `/api/reservations/handle/:reservationId`
- **功能**: 接受或拒绝预约请求
- **路径参数**:
  - `reservationId`: 预约请求ID
- **请求参数** (body):
  ```json
  {
    "action": "approve" // approve 或 reject
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "reservation": {
      "id": "预约ID",
      "userId": "发送请求用户ID",
      "friendId": "接收请求用户ID",
      "recipeId": "菜谱ID",
      "message": "预约留言",
      "status": "approved",
      "updatedAt": "更新时间"
    },
    "feedback": "再忍五分钟就能开荤啦"
  }
  ```
- **状态码**:
  - 200: 处理成功
  - 400: 无效的操作
  - 404: 预约记录不存在
  - 500: 数据库错误

### 获取用户收到的预约请求
- **请求方法**: GET
- **请求路径**: `/api/reservations/received/:userId`
- **功能**: 获取用户收到的所有预约请求
- **路径参数**:
  - `userId`: 用户ID
- **响应示例**:
  ```json
  {
    "success": true,
    "reservations": [
      {
        "id": "预约ID",
        "userId": "发送请求用户ID",
        "friendId": "接收请求用户ID",
        "recipeId": "菜谱ID",
        "message": "预约留言",
        "status": "pending",
        "createdAt": "创建时间",
        "user": {
          "id": "用户ID",
          "nickName": "用户昵称",
          "avatarUrl": "用户头像URL"
        },
        "recipe": {
          "id": "菜谱ID",
          "title": "菜谱标题",
          "image": "菜谱图片URL"
        }
      }
    ]
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 500: 数据库错误

### 获取用户发送的预约请求
- **请求方法**: GET
- **请求路径**: `/api/reservations/sent/:userId`
- **功能**: 获取用户发送的所有预约请求
- **路径参数**:
  - `userId`: 用户ID
- **响应示例**:
  ```json
  {
    "success": true,
    "reservations": [
      {
        "id": "预约ID",
        "userId": "发送请求用户ID",
        "friendId": "接收请求用户ID",
        "recipeId": "菜谱ID",
        "message": "预约留言",
        "status": "approved",
        "createdAt": "创建时间",
        "friend": {
          "id": "好友ID",
          "nickName": "好友昵称",
          "avatarUrl": "好友头像URL"
        },
        "recipe": {
          "id": "菜谱ID",
          "title": "菜谱标题",
          "image": "菜谱图片URL"
        }
      }
    ]
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 500: 数据库错误

## 消息相关 API (/api/messages)

### 接收服务端消息
- **请求方法**: POST
- **请求路径**: `/api/messages/receive`
- **功能**: 接收服务端消息
- **请求参数** (body):
  ```json
  {
    "message": "服务端消息内容"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "消息已接收",
    "receivedMessage": {
      "message": "服务端消息内容"
    }
  }
  ```

### 发送消息
- **请求方法**: POST
- **请求路径**: `/api/messages/send`
- **功能**: 发送消息给其他用户
- **请求参数** (body):
  ```json
  {
    "fromUserId": "发送者ID",
    "toUserId": "接收者ID",
    "content": "消息内容",
    "type": "消息类型" // 可选，默认text
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": {
      "id": "消息ID",
      "fromUserId": "发送者ID",
      "toUserId": "接收者ID",
      "content": "消息内容",
      "type": "text",
      "status": "sent",
      "createdAt": "创建时间"
    }
  }
  ```
- **状态码**:
  - 200: 发送成功
  - 400: 缺少必要参数
  - 500: 发送消息失败

### 获取历史消息
- **请求方法**: GET
- **请求路径**: `/api/messages/history?userId=用户ID&friendId=好友ID&limit=20&offset=0`
- **功能**: 获取两个用户之间的历史消息
- **查询参数**:
  - `userId`: 用户ID（必填）
  - `friendId`: 好友ID（必填）
  - `limit`: 消息数量限制（默认20）
  - `offset`: 偏移量（默认0）
- **响应示例**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "id": "消息ID",
        "fromUserId": "发送者ID",
        "toUserId": "接收者ID",
        "content": "消息内容",
        "type": "text",
        "status": "sent",
        "createdAt": "创建时间"
      }
    ]
  }
  ```
- **状态码**:
  - 200: 获取成功
  - 400: 缺少必要参数
  - 500: 获取历史消息失败

## 通用错误码
- **400 Bad Request**: 请求参数错误
- **404 Not Found**: 请求的资源不存在
- **500 Internal Server Error**: 服务器内部错误