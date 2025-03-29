const fs = require('fs');
const path = require('path');
const EPub = require('epub-gen');

// 创建文件夹函数
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`创建目录: ${dirPath}`);
    }
}

// 读取LRC文件内容
function readLrcFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`成功读取文件: ${filePath}`);
        return content.split('\n').filter(line => line.trim());
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error);
        return [];
    }
}

// 创建EPUB文件
async function createEpub(lrcFiles) {
    try {
        const epubDir = path.join(__dirname, 'epub');
        ensureDirectoryExists(epubDir);
        console.log(`准备生成EPUB文件，共 ${lrcFiles.length} 个章节`);

        const options = {
            title: 'Imagine Dragons 歌词集',
            author: 'Imagine Dragons',
            content: [],
            verbose: false,
            cover: path.join(__dirname, 'cover.jpg'),
            publisher: '布染',
            description: 'Imagine Dragons 精选歌词集',
            tocTitle: '目录',
            css: `
                body {
                    font-family: "Microsoft YaHei", sans-serif;
                    line-height: 1.6;
                    margin: 2em;
                }
                h1 {
                    color: #333;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 0.5em;
                }
                p {
                    margin: 0.5em 0;
                }
            `
        };

       

        // 添加每个LRC文件的内容
        for (const file of lrcFiles) {
            const fileName = path.basename(file, '.lrc');
            console.log(`处理章节: ${fileName}`);
            const content = readLrcFile(file);
            
            // 创建章节内容，只包含歌词内容
            const chapterContent = content.map(line => `<p>${line}</p>`).join('\n');
            
            options.content.push({
                title: fileName,
                data: chapterContent
            });
        }

        // 生成EPUB文件，使用时间戳
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.join(epubDir, `Imagine_Dragons_Lyrics_${timestamp}.epub`);
        console.log(`开始生成EPUB文件: ${outputPath}`);
        await new EPub(options, outputPath).promise;
        console.log(`EPUB文件已生成: ${outputPath}`);
    } catch (error) {
        console.error('生成EPUB文件时出错:', error);
        throw error;
    }
}

// 主程序
async function main() {
    try {
        const lrcDir = path.join(__dirname, 'lrc_files');
        console.log(`读取目录: ${lrcDir}`);
        
        if (!fs.existsSync(lrcDir)) {
            throw new Error(`目录不存在: ${lrcDir}`);
        }

        const files = fs.readdirSync(lrcDir);
        console.log(`目录内容:`, files);
        
        const lrcFiles = files
            .filter(file => file.endsWith('.lrc'))
            .map(file => path.join(lrcDir, file));

        console.log(`找到 ${lrcFiles.length} 个LRC文件`);
        await createEpub(lrcFiles);
    } catch (error) {
        console.error('程序运行出错:', error);
        process.exit(1);
    }
}

// 运行程序
main();