const fs = require('fs');
const path = require('path');

// 重命名函数
function renameFiles() {
    const qrcDir = path.join(__dirname, 'qrc_files');
    console.log('开始重命名文件...');
    console.log(`目录: ${qrcDir}`);

    // 检查目录是否存在
    if (!fs.existsSync(qrcDir)) {
        console.error(`目录不存在: ${qrcDir}`);
        return;
    }

    // 读取目录中的所有文件
    const files = fs.readdirSync(qrcDir);
    console.log(`找到 ${files.length} 个文件`);

    // 重命名每个文件
    for (const file of files) {
        if (file.endsWith('.qrc')) {
            console.log(`文件已有.qrc后缀，跳过: ${file}`);
            continue;
        }

        try {
            const oldPath = path.join(qrcDir, file);
            const newPath = path.join(qrcDir, `${file}.qrc`);
            
            // 检查文件是否存在
            if (!fs.existsSync(oldPath)) {
                console.error(`文件不存在: ${oldPath}`);
                continue;
            }

            // 检查目标文件是否已存在
            if (fs.existsSync(newPath)) {
                console.error(`目标文件已存在，跳过: ${newPath}`);
                continue;
            }

            // 重命名文件
            fs.renameSync(oldPath, newPath);
            console.log(`重命名成功: ${file} -> ${file}.qrc`);
        } catch (error) {
            console.error(`重命名失败 ${file}:`, error);
        }
    }

    console.log('重命名完成！');
}

// 运行程序
renameFiles();