const fs = require('fs');
const path = require('path');

// 复制文件函数
function copyFile(source, destination) {
    fs.copyFileSync(source, destination);
    console.log(`已复制: ${source} -> ${destination}`);
}

// 复制目录函数
function copyDirectory(sourceDir, destDir) {
    // 如果目标目录不存在，创建它
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    // 读取源目录中的所有文件和子目录
    const files = fs.readdirSync(sourceDir);

    files.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);

        // 检查是文件还是目录
        const stat = fs.statSync(sourcePath);
        if (stat.isFile()) {
            // 复制文件
            copyFile(sourcePath, destPath);
        } else if (stat.isDirectory()) {
            // 递归复制目录
            copyDirectory(sourcePath, destPath);
        }
    });
}

// 复制routes目录
const sourceRoutes = path.join(__dirname, 'backend/routes');
const destRoutes = path.join(__dirname, 'CaiPu_Server/routes');

console.log('开始复制routes目录...');
copyDirectory(sourceRoutes, destRoutes);
console.log('routes目录复制完成！');