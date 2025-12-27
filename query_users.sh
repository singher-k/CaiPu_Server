#!/bin/bash
# 查询用户数据
mysql -u root -pCaiPu123456 -e "SELECT id, wxId, nickName FROM myapp_db.users LIMIT 10;" 2>/dev/null
