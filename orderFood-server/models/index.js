const { Sequelize } = require('sequelize');
const { getDatabasePath } = require('../utils/getDatabasePath');
const { loadSqlite3 } = require('../utils/loadSqlite3');

// 判断是否在打包环境中
const isPacked = typeof process.pkg !== 'undefined';

// 动态加载 SQLite 驱动
let dialectModule;
const attempts = [];

try {
  dialectModule = loadSqlite3();
  console.log(`✓ 使用 sqlite3 作为 SQLite 驱动${isPacked ? '（打包环境）' : '（开发环境）'}`);
} catch (error) {
  attempts.push(`sqlite3 加载失败: ${error.message}`);
  dialectModule = undefined;
  
  console.error('❌ 无法加载 sqlite3 模块');
  console.error('   尝试的方法:');
  attempts.forEach((attempt, index) => {
    console.error(`   ${index + 1}. ${attempt}`);
  });
  
  if (isPacked) {
    console.error('\n解决方法（打包环境）:');
    console.error('   1. 确保 sqlite3 已正确安装: npm install sqlite3');
    console.error('   2. 重新构建原生模块: npm rebuild sqlite3');
    console.error('   3. 将 orderFood-server/node_modules/sqlite3 复制到可执行文件同目录的 node_modules/sqlite3');
    console.error('   4. 或使用 PM2 直接运行 Node.js 代码（推荐）');
  } else {
    console.error('\n解决方法（开发环境）:');
    console.error('   1. 安装 sqlite3: npm install sqlite3');
    console.error('   2. 重新构建: npm rebuild sqlite3');
  }
  
  console.log('\n⚠ 警告: 将尝试让 Sequelize 自动加载 SQLite 驱动（可能失败）');
}

// 创建SQLite连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: getDatabasePath(),
  logging: false, // 禁用SQL查询日志输出
  dialectModule: dialectModule // 明确指定 SQLite 驱动
});

// 初始化模型
const Meal = require('./Meal')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Settings = require('./Settings')(sequelize);
const PaymentMethod = require('./PaymentMethod')(sequelize);

// 建立关联关系
// 订单和订单明细：一对多
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// 菜品和订单明细：一对多
Meal.hasMany(OrderItem, {
  foreignKey: 'meal_id',
  as: 'orderItems'
});

OrderItem.belongsTo(Meal, {
  foreignKey: 'meal_id',
  as: 'meal'
});

// 付款方式和订单：一对多
PaymentMethod.hasMany(Order, {
  foreignKey: 'payment_method_id',
  as: 'orders'
});

Order.belongsTo(PaymentMethod, {
  foreignKey: 'payment_method_id',
  as: 'paymentMethod'
});

// 导出sequelize实例和所有模型
module.exports = {
  sequelize,
  Meal,
  Order,
  OrderItem,
  Settings,
  PaymentMethod
};
