const { sequelize, Order, Meal, OrderItem, Settings, PaymentMethod } = require('../models');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { getDatabasePath } = require('../utils/getDatabasePath');

/**
 * 数据库迁移脚本
 * 1. 删除从 queueSystem-server 复制过来的多余表
 * 2. 从旧版本（只有 orders 表）迁移到新版本（meals, orders, order_items 表）
 */
async function migrateDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    // 定义 orderFood-server 需要的表（保留这些表）
    const requiredTables = ['meals', 'orders', 'order_items', 'settings', 'payment_methods'];
    
    // 定义 queueSystem-server 的表（需要删除的表）
    const queueSystemTables = [
      'business_types',
      'counter_business_last_ticket',
      'counter_displays',
      'counters',
      'ticket_sequences'
    ];
    
    // 获取数据库中所有表
    const [allTables] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    const tableNames = allTables.map(t => t.name);
    logger.info(`数据库中发现 ${tableNames.length} 个表: ${tableNames.join(', ')}`);
    
    // 检查所有必需表的结构是否正确（只在表存在时检查）
    // 定义每个表的关键字段，用于验证表结构是否正确
    const tableStructureChecks = {
      'settings': ['key', 'category'], // settings 表必须有的字段
      'meals': ['name_zh', 'price', 'is_active'], // meals 表必须有的字段
      'orders': ['order_number', 'store_id', 'total_amount', 'order_type'], // orders 表必须有的字段
      'order_items': ['order_id', 'meal_id', 'quantity', 'price'], // order_items 表必须有的字段
      'payment_methods': ['code', 'name_zh', 'is_active'] // payment_methods 表必须有的字段
    };
    
    let needRebuild = false;
    const tablesToRebuild = [];
    
    // 检查每个必需表的结构
    for (const tableName of requiredTables) {
      if (tableNames.includes(tableName)) {
        const requiredFields = tableStructureChecks[tableName];
        if (requiredFields) {
          try {
            const [columns] = await sequelize.query(`PRAGMA table_info(${tableName})`);
            const columnNames = columns.map(col => col.name);
            const missingFields = requiredFields.filter(field => !columnNames.includes(field));
            
            if (missingFields.length > 0) {
              logger.info(`表 ${tableName} 缺少必需字段: ${missingFields.join(', ')}，将重建`);
              tablesToRebuild.push(tableName);
              needRebuild = true;
            }
          } catch (error) {
            logger.warn(`检查表 ${tableName} 结构时出错，将重建:`, error.message);
            tablesToRebuild.push(tableName);
            needRebuild = true;
          }
        }
      }
    }
    
    // 删除需要重建的表
    if (needRebuild) {
      for (const tableName of tablesToRebuild) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);
          logger.info(`✓ 已删除需要重建的表: ${tableName}`);
          const index = tableNames.indexOf(tableName);
          if (index > -1) {
            tableNames.splice(index, 1);
          }
        } catch (error) {
          logger.warn(`删除表 ${tableName} 失败:`, error.message);
        }
      }
    }
    
    // 删除 queueSystem-server 的多余表
    const tablesToDelete = tableNames.filter(name => 
      queueSystemTables.includes(name) || 
      (!requiredTables.includes(name) && name !== 'SequelizeMeta')
    );
    
    if (tablesToDelete.length > 0) {
      logger.info(`发现需要删除的表: ${tablesToDelete.join(', ')}`);
      
      for (const tableName of tablesToDelete) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);
          logger.info(`✓ 已删除表: ${tableName}`);
        } catch (error) {
          logger.warn(`删除表 ${tableName} 失败:`, error.message);
        }
      }
    } else {
      logger.info('没有需要删除的多余表');
    }
    
    // 检查是否存在旧的 orders 表结构
    const [ordersTable] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='orders'
    `);
    
    if (ordersTable.length === 0) {
      logger.info('数据库中没有 orders 表，将创建新表结构');
      // 直接创建新表结构
      await sequelize.sync({ alter: true });
      const { initMeals } = require('./initMeals');
      await initMeals();
      const { initSettings } = require('./initSettings');
      await initSettings();
      const { initPaymentMethods } = require('./initPaymentMethods');
      await initPaymentMethods();
      logger.info('数据库初始化完成！');
      return;
    }
    
    // 检查旧表结构（检查是否有 meal_id 或 meal_type 字段，这是旧版本的特征）
    const [columns] = await sequelize.query(`
      PRAGMA table_info(orders)
    `);
    
    const columnNames = columns.map(col => col.name);
    const hasOldStructure = columnNames.includes('meal_id') || columnNames.includes('meal_type');
    const hasNewStructure = columnNames.includes('store_id') && columnNames.includes('total_amount');
    
    // 检查所有必需的表是否存在
    const [existingTables] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    const existingTableNames = existingTables.map(t => t.name);
    const missingTables = requiredTables.filter(name => !existingTableNames.includes(name));
    
    if (hasNewStructure && !hasOldStructure) {
      if (missingTables.length > 0 || needRebuild) {
        logger.info(`数据库结构基本正确，但${missingTables.length > 0 ? `缺少以下表: ${missingTables.join(', ')}` : ''}${missingTables.length > 0 && needRebuild ? '，且' : ''}${needRebuild ? `需要重建以下表: ${tablesToRebuild.join(', ')}` : ''}，将创建/更新表结构`);
        // 确保所有表都被创建
        await sequelize.sync({ alter: true });
        // 初始化缺失的数据
        if (missingTables.includes('meals') || tablesToRebuild.includes('meals')) {
          const { initMeals } = require('./initMeals');
          await initMeals();
        }
        if (missingTables.includes('settings') || tablesToRebuild.includes('settings')) {
          const { initSettings } = require('./initSettings');
          await initSettings();
        }
        logger.info('表结构已更新并初始化完成');
      } else {
        // 所有表都存在且结构正确，只做快速检查，不执行 sync（提高启动速度）
        logger.info('数据库结构已是最新版本，所有必需表都存在且结构正确，跳过同步');
      }
      return;
    }
    
    if (!hasOldStructure) {
      logger.info('数据库表结构异常，将重新创建');
    }
    
    logger.info('检测到旧版本数据库结构，开始迁移...');
    
    // 备份旧数据（如果有订单数据）
    const [oldOrders] = await sequelize.query(`
      SELECT * FROM orders
    `);
    
    if (oldOrders.length > 0) {
      const backupPath = path.join(
        path.dirname(getDatabasePath()),
        `database-backup-${Date.now()}.json`
      );
      fs.writeFileSync(backupPath, JSON.stringify(oldOrders, null, 2), 'utf8');
      logger.info(`已备份 ${oldOrders.length} 条旧订单数据到: ${backupPath}`);
    }
    
    // 删除旧表
    logger.info('删除旧表结构...');
    await sequelize.query(`DROP TABLE IF EXISTS orders`);
    
    // 重新创建表结构
    logger.info('创建新表结构...');
    await sequelize.sync({ alter: true });
    
    // 初始化默认菜品数据
    const { initMeals } = require('./initMeals');
    await initMeals();
    
    // 初始化系统设置
    const { initSettings } = require('./initSettings');
    await initSettings();
    
    // 初始化付款方式数据
    const { initPaymentMethods } = require('./initPaymentMethods');
    await initPaymentMethods();
    
    logger.info('数据库迁移完成！');
    logger.info('注意：旧订单数据已备份，但未自动迁移到新结构。');
    logger.info('如需恢复旧订单，请手动处理备份文件。');
    
  } catch (error) {
    logger.error('数据库迁移失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  (async () => {
    try {
      await migrateDatabase();
      process.exit(0);
    } catch (error) {
      console.error('迁移失败:', error);
      process.exit(1);
    }
  })();
}

module.exports = { migrateDatabase };
