#!/bin/bash
# 查询所有用户数据
mysql -u root -pCaiPu123456 -e "SELECT id, wxId, nickName, avatarUrl, createdAt FROM myapp_db.users;" 2>/dev/null
