const express = require('express');
const router = express.Router();
const orderFoodRoutes = require('./orderFood');

// API文档路由
router.get('/', (req, res) => {
  const apiEndpoints = [
    { method: 'POST', path: '/api/orderfood/orders', description: '创建订单并打印小票' },
    { method: 'GET', path: '/api/orderfood/meals', description: '获取套餐列表' }
  ];

  const html = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自助点单系统API文档</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
      h1 { color: #1a73e8; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f2f2f2; }
      tr:hover { background-color: #f5f5f5; }
      .method { font-weight: bold; }
      .get { color: #4CAF50; }
      .post { color: #2196F3; }
    </style>
  </head>
  <body>
    <h1>自助点单系统API文档</h1>
    <table>
      <tr>
        <th>请求方法</th>
        <th>接口路径</th>
        <th>描述</th>
      </tr>
      ${apiEndpoints.map(endpoint => `
        <tr>
          <td class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</td>
          <td>${endpoint.path}</td>
          <td>${endpoint.description}</td>
        </tr>
      `).join('')}
    </table>
  </body>
  </html>
  `;

  res.send(html);
});

// 自助点单路由
router.use('/orderfood', orderFoodRoutes);

module.exports = router;
