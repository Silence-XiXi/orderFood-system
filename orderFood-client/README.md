# 自助点单系统前端

## 简介

这是一个自助点单系统的前端应用，允许顾客选择套餐（一菜或两菜），然后进行付款并打印小票。

## 功能特性

- 套餐选择：支持一菜套餐（¥15）和两菜套餐（¥25）
- 付款确认：点击付款按钮确认订单
- 自动打印：付款成功后自动打印订单小票

## 安装和运行

### 1. 安装依赖

```bash
cd orderFood-client
npm install
```

### 2. 开发模式运行

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（默认端口）

### 3. 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist` 目录

## 配置

### 后端 API 地址配置

在 `vite.config.js` 中可以通过环境变量配置后端地址：

```bash
# Windows PowerShell
$env:VITE_API_TARGET="http://127.0.0.1:3000"
npm run dev

# Linux/Mac
VITE_API_TARGET=http://127.0.0.1:3000 npm run dev
```

默认后端地址为 `http://127.0.0.1:3000`

## API 接口

### 创建订单
- **URL**: `POST /api/orderfood/orders`
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
- **URL**: `GET /api/orderfood/meals`
- **响应**:
  ```json
  [
    { "id": 1, "name": "一菜套餐", "price": 15 },
    { "id": 2, "name": "两菜套餐", "price": 25 }
  ]
  ```

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Pinia
- Axios
- Vite
