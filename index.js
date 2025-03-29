const fs = require('fs');
const smartLyric = require('smart-lyric');
const path = require('path');

// 创建文件夹函数
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

async function convertQrcToLrc(inputPath, outputPath) {
    try {
        console.log('开始读取文件...');
        const qrcContent = fs.readFileSync(inputPath);
        console.log('文件读取成功，大小：', qrcContent.length, '字节');

        console.log('开始解密QRC...');
        const decryptedContent = smartLyric.qrc.decrypt(qrcContent);
        console.log('QRC解密成功');

        console.log('开始解析歌词...');
        const lyrics = smartLyric.qrc.parse(decryptedContent);
        console.log('歌词解析成功');

        let lrcContent = '';
        
        // 添加元数据标签
        if (lyrics.ti) lrcContent += `${lyrics.ti}\n`;
        if (lyrics.ar) lrcContent += `${lyrics.ar}\n`;
        if (lyrics.al) lrcContent += `${lyrics.al}\n`;

        // 处理歌词内容
        if (lyrics.content && Array.isArray(lyrics.content)) {
            for (const line of lyrics.content) {
                if (line.content) {
                    // 获取歌词文本
                    let text = '';
                    if (Array.isArray(line.content)) {
                        text = line.content.map(word => word.content || '').join('');
                    } else {
                        text = line.content.toString();
                    }
                    
                    if (text.trim()) {  // 只添加非空行
                        lrcContent += `${text}\n`;
                    }
                }
            }
        }

        console.log('开始写入文件...');
        fs.writeFileSync(outputPath, lrcContent);
        console.log('文件写入成功');

        return true;
    } catch (error) {
        console.error('转换失败：');
        console.error('错误名称：', error.name);
        console.error('错误信息：', error.message);
        console.error('错误堆栈：', error.stack);
        return false;
    }
}

// 处理文件夹中的所有QRC文件
async function processDirectory(inputDir, outputDir) {
    // 确保输入和输出目录存在
    ensureDirectoryExists(inputDir);
    ensureDirectoryExists(outputDir);

    // 读取输入目录中的所有文件
    const files = fs.readdirSync(inputDir);
    
    // 过滤出QRC文件
    const qrcFiles = files.filter(file => file.toLowerCase().endsWith('.qrc'));
    
    console.log(`找到 ${qrcFiles.length} 个QRC文件`);

    // 处理每个QRC文件
    for (const file of qrcFiles) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace('.qrc', '.lrc'));
        
        console.log(`\n处理文件: ${file}`);
        await convertQrcToLrc(inputPath, outputPath);
    }
}

// 创建输入和输出目录
const inputDir = path.join(__dirname, 'qrc_files');
const outputDir = path.join(__dirname, 'lrc_files');

// 执行批量转换
processDirectory(inputDir, outputDir);