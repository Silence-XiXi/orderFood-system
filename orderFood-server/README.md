# 自助点单系统后端

## 简介

这是自助点单系统的独立后端服务，与取号叫号系统（queueSystem-server）完全分离，可以独立部署和运行。

## 功能特性

- 订单创建：接收前端订单请求
- 小票打印：自动打印订单小票
- 套餐管理：提供套餐列表查询接口

## 安装和运行

### 1. 安装依赖

```powershell
cd orderFood-server
npm install
```

### 2. 开发模式运行

```powershell
npm run dev
```

### 3. 生产模式运行

```powershell
npm start
```

## 配置

### 端口配置

默认端口为 `3002`，可通过环境变量修改：

```powershell
$env:PORT=8080
npm start
```

### 打印机配置

打印机配置位于 `printer.config.json`，包含：
- 打印机端口
- 打印机名称
- 编码设置等

### 数据库

点单系统使用独立的数据库文件：`database-orderfood.sqlite`

## API 接口

### 创建订单
- **URL**: `POST http://localhost:3002/api/orderfood/orders`
- **请求体**:
  ```json
  {
    "mealId": 1,
    "mealType": "一菜套餐",
    "price": 15
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "订单创建成功，小票已打印",
    "orderNumber": "OF12345678"
  }
  ```

### 获取套餐列表
- **URL**: `GET http://localhost:3002/api/orderfood/meals`
- **响应**:
  ```json
  [
    { "id": 1, "name": "一菜套餐", "price": 15 },
    { "id": 2, "name": "两菜套餐", "price": 25 }
  ]
  ```

## 项目结构

```
orderFood-server/
├── controllers/          # 控制器
│   └── orderFoodController.js
├── routes/              # 路由
│   ├── index.js
│   └── orderFood.js
├── services/            # 服务层
│   ├── orderFoodService.js
│   └── printerService.js
├── utils/               # 工具函数
│   ├── logger.js
│   ├── getDatabasePath.js
│   ├── loadPrinterModules.js
│   └── printerLogger.js
├── printer_sdk/         # 打印机 SDK
├── app.js              # Express 应用
├── index.js            # 服务器入口
├── package.json        # 依赖配置
└── printer.config.json # 打印机配置
```

## 与取号系统的区别

- **完全独立**：不依赖取号系统的任何代码
- **简化架构**：移除了数据库、WebSocket、定时任务等复杂功能
- **专注点单**：只包含点单和打印功能
- **独立部署**：可以部署在不同的设备上

## 注意事项

1. 确保打印机 DLL 文件在 `printer_sdk` 目录中
2. 打印机配置需要根据实际硬件调整
3. 如果不需要数据库功能，可以进一步简化代码
