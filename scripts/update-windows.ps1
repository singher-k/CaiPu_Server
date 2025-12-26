# Windows本地更新脚本
# 使用方法: .\update-windows.ps1

param(
    [string]$Version = "",
    [switch]$SkipBackup = $false,
    [string]$LogFile = ""
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 获取脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Split-Path -Parent $ScriptDir
$BackupDir = Join-Path $ProjectDir "backups"
$LogDir = Join-Path $ProjectDir "logs"

# 设置日志文件
if (-not $LogFile) {
    $LogFile = Join-Path $LogDir "update_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
}

# 创建必要目录
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# 日志函数
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

# 错误处理函数
function Invoke-ErrorExit {
    param([string]$ErrorMessage)
    Write-Log "❌ 错误: $ErrorMessage"
    exit 1
}

# 预检查函数
function Test-PreUpdate {
    Write-Log "🔍 执行预更新检查..."
    
    # 检查Node.js
    try {
        $nodeVersion = node --version
        Write-Log "✅ Node.js版本: $nodeVersion"
    } catch {
        Invoke-ErrorExit "Node.js未安装或无法访问"
    }
    
    # 检查NPM
    try {
        $npmVersion = npm --version
        Write-Log "✅ NPM版本: $npmVersion"
    } catch {
        Invoke-ErrorExit "NPM未安装或无法访问"
    }
    
    # 检查Git
    try {
        $gitVersion = git --version
        Write-Log "✅ Git版本: $gitVersion"
    } catch {
        Invoke-ErrorExit "Git未安装或无法访问"
    }
    
    # 检查服务状态
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $runningServices = $nodeProcesses | Where-Object { $_.ProcessName -eq "node" }
        if ($runningServices) {
            Write-Log "⚠️ 检测到Node进程正在运行"
        }
    }
    
    Write-Log "✅ 预更新检查完成"
}

# 备份函数
function New-Backup {
    if ($SkipBackup) {
        Write-Log "⏭️ 跳过备份"
        return
    }
    
    Write-Log "📦 创建备份..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    # 代码备份
    $backupFile = Join-Path $BackupDir "code_backup_$timestamp.tar.gz"
    try {
        # 使用PowerShell压缩（因为Windows没有tar命令）
        $excludePatterns = @("node_modules", "test", "logs", "backups", "*.log", ".git")
        Get-ChildItem $ProjectDir -Exclude $excludePatterns | Compress-Archive -DestinationPath $backupFile -Force
        Write-Log "✅ 代码备份完成: $backupFile"
    } catch {
        Write-Log "⚠️ 代码备份失败: $_"
    }
    
    # 清理旧备份（保留最近5个）
    $oldBackups = Get-ChildItem $BackupDir -Filter "code_backup_*.tar.gz" | Sort-Object CreationTime -Descending | Select-Object -Skip 5
    $oldBackups | Remove-Item -Force
    
    Write-Log "✅ 备份完成"
}

# 代码更新函数
function Update-Code {
    Write-Log "📥 更新代码..."
    
    Set-Location $ProjectDir
    
    try {
        # 停止服务
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-Log "🛑 停止服务..."
            $nodeProcesses | Stop-Process -Force
            Start-Sleep -Seconds 2
        }
        
        # 获取最新代码
        git fetch origin
        if ($Version) {
            Write-Log "📋 更新到版本/分支: $Version"
            
            # 检查是否是标签
            $tags = git tag
            if ($tags -contains $Version) {
                Write-Log "🏷️ 找到标签: $Version"
                git checkout $Version
            } else {
                # 尝试作为分支处理
                $branches = git branch -a
                if ($branches -match $Version) {
                    Write-Log "🌿 找到分支: $Version"
                    git checkout $Version
                } else {
                    Write-Log "⚠️ 标签/分支 $Version 不存在，使用main分支"
                    git checkout main
                    git pull origin main
                }
            }
        } else {
            Write-Log "📋 更新到最新代码"
            $currentBranch = git branch --show-current
            git pull origin $currentBranch
        }
        
        # 安装依赖
        Write-Log "📦 安装依赖..."
        npm install --production
        
        Write-Log "✅ 代码更新完成"
        
    } catch {
        Invoke-ErrorExit "代码更新失败: $_"
    }
}

# 启动服务函数
function Start-Service {
    Write-Log "🚀 启动服务..."
    
    try {
        $logFile = Join-Path $ProjectDir "app.log"
        $process = Start-Process -FilePath "node" -ArgumentList "app.js" -WorkingDirectory $ProjectDir -RedirectStandardOutput $logFile -RedirectStandardError $logFile -PassThru
        Write-Log "✅ 服务启动完成 (PID: $($process.Id))"
        
        # 等待服务启动
        Start-Sleep -Seconds 3
        
        # 健康检查
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Log "✅ 服务健康检查通过"
            }
        } catch {
            Write-Log "⚠️ 健康检查失败: $_"
        }
        
    } catch {
        Invoke-ErrorExit "服务启动失败: $_"
    }
}

# 主程序
try {
    Write-Log "========================================"
    Write-Log "🚀 开始CaiPu服务器更新流程"
    Write-Log "📅 更新日期: $(Get-Date)"
    if ($Version) {
        Write-Log "📦 版本: $Version"
    }
    Write-Log "📂 项目目录: $ProjectDir"
    Write-Log "========================================"
    
    Test-PreUpdate
    New-Backup
    Update-Code
    Start-Service
    
    $endTime = Get-Date
    Write-Log "========================================"
    Write-Log "✅ 更新完成！总耗时: $(($endTime - $startTime).TotalSeconds) 秒"
    Write-Log "========================================"
    
} catch {
    Write-Log "❌ 更新过程中发生错误: $_"
    exit 1
}