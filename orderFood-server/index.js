// 设置控制台编码（解决 Windows 繁体中文系统乱码问题）
if (process.platform === 'win32') {
  try {
    const { execSync } = require('child_process');
    try {
      execSync('chcp 936 >nul 2>&1', { stdio: 'ignore' });
    } catch (e) {
      // 忽略错误
    }
    process.stdout.setDefaultEncoding('gbk');
    process.stderr.setDefaultEncoding('gbk');
  } catch (error) {
    // 忽略编码设置错误
  }
}

const app = require('./app');
const http = require('http');
const os = require('os');
const printerService = require('./services/printerService');
const logger = require('./utils/logger');
const { sequelize } = require('./models');
const { initMeals } = require('./scripts/initMeals');
const { initSettings } = require('./scripts/initSettings');
const { initPaymentMethods } = require('./scripts/initPaymentMethods');
const { migrateDatabase } = require('./scripts/migrateDatabase');

const PORT = process.env.PORT || 3002;
const server = http.createServer(app);

// 初始化数据库
async function initDatabase() {
  try {
    // 先执行数据库迁移（如果需要）
    try {
      await migrateDatabase();
    } catch (migrateError) {
      logger.warn('数据库迁移检查失败，继续初始化:', migrateError.message);
    }
    
    // 同步数据库模型（创建表结构）
    // 使用 alter: true 确保所有表都被创建，包括新添加的 settings 表
    await sequelize.sync({ alter: true });
    logger.info('数据库表结构同步成功', null, true);
    
    // 初始化默认菜品数据
    await initMeals();
    
    // 初始化系统设置
    await initSettings();
    
    // 初始化付款方式数据
    await initPaymentMethods();
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    // 数据库初始化失败不影响服务器启动，但记录错误
  }
}

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    
    // 初始化打印机
    try {
      if (printerService.isAvailable()) {
        const initResult = await printerService.initPrinter();
        if (initResult) {
          logger.info('✅ 打印机初始化成功', null, true);
        } else {
          logger.warn('⚠️  打印机初始化失败，但服务器将继续运行', null, true);
        }
      } else {
        logger.info('ℹ️  打印机功能未启用（DLL未加载或已禁用）', null, true);
      }
    } catch (error) {
      logger.error('初始化打印机时发生错误:', error);
    }
    
    server.listen(PORT, '0.0.0.0', () => {
      // 获取所有网络接口的IP地址
      const networkInterfaces = os.networkInterfaces();
      const addresses = [];
      
      Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address);
          }
        });
      });
      
      const primaryIP = addresses.length > 0 ? addresses[0] : 'localhost';
      
      // 构建启动信息
      let startupInfo = '\n========================================\n';
      startupInfo += '自助点单系统服务器启动成功！\n';
      startupInfo += '========================================\n';
      startupInfo += `本地访问地址:\n`;
      startupInfo += `  http://localhost:${PORT}\n`;
      startupInfo += `  http://127.0.0.1:${PORT}\n`;
      startupInfo += `\n网络访问地址:\n`;
      
      if (addresses.length > 0) {
        addresses.forEach((ip) => {
          startupInfo += `  http://${ip}:${PORT}\n`;
        });
      } else {
        startupInfo += `  (未检测到网络接口，请检查网络配置)\n`;
      }
      
      startupInfo += `\nAPI接口:\n`;
      startupInfo += `  创建订单: POST http://${primaryIP}:${PORT}/api/orderfood/orders\n`;
      startupInfo += `  获取套餐: GET http://${primaryIP}:${PORT}/api/orderfood/meals\n`;
      startupInfo += `  获取付款方式: GET http://${primaryIP}:${PORT}/api/orderfood/payment-methods\n`;
      startupInfo += `\n💡提示: 从其他设备访问时，请使用网络访问地址\n`;
      startupInfo += '========================================\n';
      startupInfo += '按 Ctrl+C 停止服务器\n';
      
      console.log(startupInfo);
      logger.info('服务器启动成功', {
        port: PORT,
        localAddresses: [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
        networkAddresses: addresses.map(ip => `http://${ip}:${PORT}`)
      });
    });
    
    // 处理服务器监听错误
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const errorMsg = `❌ 错误: 端口 ${PORT} 已被占用\n   解决方法:\n   1. 关闭占用端口 ${PORT} 的程序\n   2. 或使用环境变量设置其他端口: set PORT=8080`;
        console.error(errorMsg);
        logger.error(`端口 ${PORT} 已被占用`, error);
      } else {
        console.error('❌ 服务器启动失败:', error);
        logger.error('服务器启动失败:', error);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ 启动服务器时发生严重错误:');
    console.error('错误信息:', error.message);
    logger.error('启动服务器时发生严重错误:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  logger.error('未捕获的异常', error);
  process.exit(1);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  logger.error('未处理的 Promise 拒绝', { reason, promise });
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  logger.info('收到 SIGTERM 信号，正在关闭服务器');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n收到 SIGINT 信号，正在关闭服务器...');
  logger.info('收到 SIGINT 信号，正在关闭服务器');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

// 启动服务器
startServer();
