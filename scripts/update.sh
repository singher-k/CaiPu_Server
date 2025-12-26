#!/bin/bash
# 一键更新脚本
# 使用方法: ./update.sh <version_tag>

set -e

# 配置文件路径
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/logs/update_$(date +%Y%m%d_%H%M%S).log"

# 从.env文件加载环境变量
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

VERSION=$1
START_TIME=$(date +%s)

# 创建必要的目录
mkdir -p "$(dirname $LOG_FILE)"
mkdir -p "$BACKUP_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 错误处理
error_exit() {
    log "❌ 错误: $1"
    exit 1
}

# 预检查函数
pre_update_check() {
    log "🔍 执行预更新检查..."
    
    # 检查Node.js
    if ! command -v node > /dev/null 2>&1; then
        error_exit "Node.js未安装"
    fi
    
    # 检查NPM
    if ! command -v npm > /dev/null 2>&1; then
        error_exit "NPM未安装"
    fi
    
    # 检查Git
    if ! command -v git > /dev/null 2>&1; then
        error_exit "Git未安装"
    fi
    
    # 检查磁盘空间
    DISK_USAGE=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 85 ]; then
        error_exit "磁盘空间不足: ${DISK_USAGE}%"
    fi
    
    # 检查服务是否正在运行
    if command -v pgrep > /dev/null 2>&1; then
        # Linux/Mac系统
        if pgrep -f "node.*app.js" > /dev/null 2>&1; then
            log "⚠️ 检测到服务正在运行"
        else
            log "ℹ️ 服务未运行"
        fi
    elif command -v tasklist > /dev/null 2>&1; then
        # Windows系统
        if tasklist | grep -i "node" | grep -i "app.js" > /dev/null 2>&1; then
            log "⚠️ 检测到服务正在运行"
        else
            log "ℹ️ 服务未运行"
        fi
    else
        log "ℹ️ 无法检测服务状态"
    fi
    
    log "✅ 预更新检查完成"
}

# 备份函数
create_backup() {
    log "📦 创建备份..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    # 代码备份（排除node_modules等）
    tar -czf "$BACKUP_DIR/code_backup_$TIMESTAMP.tar.gz" \
        -C "$PROJECT_DIR" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='test/' \
        --exclude='logs/' \
        --exclude='backups/' \
        --exclude='*.log' \
        .
    
    # 数据库备份（如果配置了数据库）
    if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ]; then
        mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > \
            "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null || \
            log "⚠️ 数据库备份失败，跳过"
    fi
    
    # 清理旧备份（保留最近5个）
    ls -t "$BACKUP_DIR"/code_backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f
    ls -t "$BACKUP_DIR"/db_backup_*.sql 2>/dev/null | tail -n +6 | xargs rm -f
    
    log "✅ 备份完成"
}

# 代码更新函数
update_code() {
    log "📥 更新代码..."
    
    cd "$PROJECT_DIR"
    
    # 停止服务
    if command -v pgrep > /dev/null 2>&1; then
        # Linux/Mac系统
        if pgrep -f "node.*app.js" > /dev/null 2>&1; then
            log "🛑 停止服务..."
            pkill -f "node.*app.js" || log "⚠️ 服务停止可能失败"
            sleep 2
        fi
    elif command -v tasklist > /dev/null 2>&1; then
        # Windows系统
        if tasklist | grep -i "node" | grep -i "app.js" > /dev/null 2>&1; then
            log "🛑 停止服务..."
            taskkill /F /IM node.exe 2>/dev/null || log "⚠️ 服务停止可能失败"
            sleep 2
        fi
    else
        log "⚠️ 无法检测服务状态，请手动停止服务"
    fi
    
    # 检查是否提供了版本标签
    if [ -n "$VERSION" ]; then
        log "📋 更新到版本: $VERSION"
        git fetch origin || error_exit "Git fetch失败"
        
        # 检查标签是否存在
        if git tag | grep -q "^${VERSION}$"; then
            log "🏷️ 找到标签: $VERSION"
            git checkout "$VERSION" || error_exit "Git checkout失败"
        else
            log "⚠️ 标签 $VERSION 不存在，检查分支..."
            if git branch -a | grep -q "^.*${VERSION}$"; then
                log "🌿 找到分支: $VERSION"
                git checkout "$VERSION" || error_exit "Git checkout失败"
            else
                log "⚠️ 标签和分支 $VERSION 都不存在，使用main分支"
                git checkout main || error_exit "Git checkout main失败"
                git pull origin main || error_exit "Git pull失败"
            fi
        fi
    else
        log "📋 使用当前分支更新"
        CURRENT_BRANCH=$(git branch --show-current)
        git fetch origin || error_exit "Git fetch失败"
        git pull origin "$CURRENT_BRANCH" || error_exit "Git pull失败"
    fi
    
    # 安装依赖
    log "📦 安装依赖..."
    npm install --production || error_exit "NPM install失败"
    
    log "✅ 代码更新完成"
}

# 数据库更新函数
update_database() {
    log "💾 更新数据库..."
    
    if [ -f "$PROJECT_DIR/models/createTables.js" ]; then
        cd "$PROJECT_DIR"
        node models/createTables.js || log "⚠️ 数据库更新可能失败"
        log "✅ 数据库更新完成"
    else
        log "ℹ️ 未找到数据库更新脚本，跳过"
    fi
}

# 服务启动函数
start_service() {
    log "🚀 启动服务..."
    
    cd "$PROJECT_DIR"
    
    # 启动服务（使用nohup）
    nohup node app.js > logs/app.log 2>&1 &
    SERVICE_PID=$!
    
    # 等待服务启动
    sleep 5
    
    # 验证服务状态
    if kill -0 "$SERVICE_PID" 2>/dev/null; then
        log "✅ 服务启动成功 (PID: $SERVICE_PID)"
    else
        error_exit "服务启动失败"
    fi
}

# 验证函数
verify_update() {
    log "🔍 验证更新..."
    
    # 等待服务完全启动
    sleep 3
    
    # 测试健康检查端点
    if curl -f -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
        log "✅ 健康检查端点正常"
    else
        log "⚠️ 健康检查端点可能异常"
    fi
    
    # 测试API端点（使用模拟代码）
    RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"code": "mock_verification"}' 2>/dev/null || echo "")
    
    if echo "$RESPONSE" | grep -q "success\|dbStatus\|用户\|openid"; then
        log "✅ API端点测试正常"
    else
        log "⚠️ API端点测试异常: $RESPONSE"
    fi
    
    log "✅ 更新验证完成"
}

# 回滚函数
rollback() {
    log "🔙 开始回滚..."
    
    # 停止服务
    pkill -f "node.*app.js" || true
    sleep 2
    
    # 恢复最新备份
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/code_backup_*.tar.gz 2>/dev/null | head -1)
    if [ -f "$LATEST_BACKUP" ]; then
        log "📦 恢复代码备份: $(basename $LATEST_BACKUP)"
        tar -xzf "$LATEST_BACKUP" -C "$PROJECT_DIR" || log "⚠️ 代码恢复失败"
    fi
    
    # 恢复数据库备份（如果存在）
    LATEST_DB_BACKUP=$(ls -t "$BACKUP_DIR"/db_backup_*.sql 2>/dev/null | head -1)
    if [ -f "$LATEST_DB_BACKUP" ]; then
        log "💾 恢复数据库备份: $(basename $LATEST_DB_BACKUP)"
        if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ]; then
            mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$LATEST_DB_BACKUP" 2>/dev/null || \
                log "⚠️ 数据库恢复失败"
        fi
    fi
    
    # 重新安装依赖
    npm install --production 2>/dev/null || log "⚠️ 依赖安装失败"
    
    # 重启服务
    start_service
    
    log "✅ 回滚完成"
}

# 主流程
main() {
    log "========================================"
    log "🚀 开始CaiPu服务器更新流程"
    log "📅 更新日期: $(date)"
    log "📦 版本: ${VERSION:-'current'}"
    log "📂 项目目录: $PROJECT_DIR"
    log "========================================"
    
    # 执行各个阶段
    pre_update_check
    create_backup
    update_code
    update_database
    start_service
    verify_update
    
    # 计算执行时间
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log "========================================"
    log "🎉 更新完成！"
    log "⏱️ 总耗时: ${DURATION}秒"
    log "📅 完成时间: $(date)"
    log "📋 详细日志: $LOG_FILE"
    log "========================================"
}

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 请提供版本号: ./update.sh <version_tag>"
    echo "示例: ./update.sh v1.2.0"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "app.js" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 设置信号处理
trap 'error_exit "脚本被中断"' INT TERM

# 执行主流程
main