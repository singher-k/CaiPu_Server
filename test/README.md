# 测试工具文件夹

本文件夹包含各种测试脚本和工具，用于开发和调试CaiPu服务器。

## 📁 文件分类

### 登录测试相关
- `debug_login.js` - 微信登录流程调试工具
- `test_mock_login.js` - 模拟登录测试（测试数据库错误处理）
- `test_wechat_login.js` - 微信登录功能测试
- `test_login_direct.js` - 直接登录测试

### 数据库测试相关
- `test_db_connection.js` - 数据库连接测试
- `test_db_error.js` - 数据库错误处理测试
- `test_db_list.js` - 数据库列表查询测试
- `clear_test_data.js` - 清理测试数据

### 服务器测试相关
- `test_app.js` - 应用服务器测试
- `test_server_connection.js` - 服务器连接测试
- `capture_logs.js` - 日志捕获工具

### 数据初始化相关
- `init_database.js` - 数据库初始化
- `insert_default_recipes.js` - 插入默认菜谱
- `test_data.js` - 测试数据管理

### 通用测试工具
- `simple_test.js` - 简单测试脚本
- `test_simple.js` - 简单功能测试
- `copy_files.js` - 文件复制工具

## 🚀 常用测试命令

### 测试模拟登录功能
```bash
cd test
node test_mock_login.js
```

### 测试数据库连接
```bash
cd test
node test_db_connection.js
```

### 调试微信登录
```bash
cd test
node debug_login.js
```

### 清理测试数据
```bash
cd test
node clear_test_data.js
```

## ⚠️ 注意事项

1. **开发环境专用**: 这些工具仅用于开发和测试，不要在生产环境中使用
2. **模拟模式**: `test_mock_login.js` 包含模拟微信API功能，可用于测试数据库错误处理
3. **数据库操作**: 部分脚本会操作数据库，请谨慎使用
4. **环境依赖**: 确保服务器正在运行（`node app.js`）再执行相关测试

## 🔧 主要功能验证

### 模拟登录测试 (test_mock_login.js)
- ✅ 模拟微信API响应
- ✅ 模拟数据库连接失败
- ✅ 返回503状态码
- ✅ 提供临时用户数据
- ✅ 详细的错误状态信息

### 调试工具 (debug_login.js)
- ✅ 完整的微信登录流程测试
- ✅ 详细的响应分析
- ✅ 错误信息展示
- ✅ 配置状态检查

## 📞 技术支持

如需添加新的测试功能或修改现有测试工具，请参考现有的脚本结构。