const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const logger = require('./utils/logger');
const { getPublicDirPath } = require('./utils/getPublicDirPath');

const app = express();

// 中间件
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', routes);

// 静态文件服务（提供前端构建的文件）
let publicDir;
try {
  publicDir = getPublicDirPath();
  
  // 验证 public 目录是否存在
  if (!fs.existsSync(publicDir)) {
    logger.warn(`public 目录不存在: ${publicDir}`);
  } else {
    const indexHtmlPath = path.join(publicDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      logger.warn(`index.html 不存在于: ${indexHtmlPath}`);
    } else {
      logger.info(`✓ 静态文件目录已配置: ${publicDir}`);
    }
  }
} catch (error) {
  logger.error('获取 public 目录路径失败:', error);
  // 使用默认路径
  publicDir = path.join(__dirname, 'public');
  logger.warn(`使用默认 public 目录: ${publicDir}`);
}

app.use(express.static(publicDir));

// 回退路由：所有非API请求都返回 index.html（支持 Vue Router 的 history 模式）
// 使用中间件方式而不是通配符路由，避免 path-to-regexp 版本兼容问题
app.use((req, res, next) => {
  // 如果请求的是 API 路径，跳过（应该已经被 /api 路由处理了）
  if (req.path.startsWith('/api')) {
    return next(); // 让 Express 返回 404
  }
  
  // 如果请求的是静态资源（已经有扩展名），跳过
  // 静态文件应该已经被 express.static 处理了
  if (req.path.includes('.')) {
    return next(); // 让 Express 返回 404
  }
  
  // 返回前端应用的 index.html（SPA 回退）
  const indexHtmlPath = path.join(publicDir, 'index.html');
  
  // 检查文件是否存在
  if (!fs.existsSync(indexHtmlPath)) {
    logger.error(`index.html 不存在: ${indexHtmlPath}`);
    return res.status(404).send(`
      <html>
        <head><title>前端文件未找到</title></head>
        <body>
          <h1>前端文件未找到</h1>
          <p>请确保已构建前端应用并正确打包。</p>
          <p>预期路径: ${indexHtmlPath}</p>
        </body>
      </html>
    `);
  }
  
  res.sendFile(indexHtmlPath, (err) => {
    if (err) {
      logger.error('无法发送 index.html', err);
      res.status(500).send('服务器错误：无法读取前端文件');
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error('Express 错误处理中间件捕获的错误', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
