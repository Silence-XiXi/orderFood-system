const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// 中间件
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', routes);

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
