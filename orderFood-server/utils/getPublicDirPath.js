const path = require('path');
const fs = require('fs');

/**
 * 获取 public 目录路径（点单系统专用）
 * 在打包后的环境中，优先使用可执行文件同目录下的 public 目录
 * @returns {string} public 目录路径
 */
function getPublicDirPath() {
  // 如果设置了环境变量，优先使用
  if (process.env.PUBLIC_DIR_PATH) {
    return process.env.PUBLIC_DIR_PATH;
  }
  
  // 判断是否在打包环境中（pkg 打包后 __dirname 会指向快照目录）
  const isPacked = typeof process.pkg !== 'undefined';
  
  if (isPacked) {
    // 打包环境：优先使用可执行文件同目录下的 public 目录
    const execPath = process.execPath; // 可执行文件路径
    const execDir = path.dirname(execPath);
    const externalPublicDir = path.join(execDir, 'public');
    
    // 如果外部 public 目录存在，优先使用
    if (fs.existsSync(externalPublicDir)) {
      const indexHtmlPath = path.join(externalPublicDir, 'index.html');
      if (fs.existsSync(indexHtmlPath)) {
        return externalPublicDir;
      }
    }
    
    // 如果外部不存在，尝试从快照目录加载（打包内的 public）
    const snapshotPaths = [
      path.join(__dirname, '../public'),
      path.join(process.cwd(), 'public'),
    ];
    
    for (const publicPath of snapshotPaths) {
      if (fs.existsSync(publicPath)) {
        const indexHtmlPath = path.join(publicPath, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          return publicPath;
        }
      }
    }
    
    // 如果都不存在，返回外部路径（至少会给出明确的错误）
    return externalPublicDir;
  } else {
    // 开发环境：使用项目目录下的 public 目录
    return path.join(__dirname, '../public');
  }
}

module.exports = { getPublicDirPath };
