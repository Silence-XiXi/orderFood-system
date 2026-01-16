const { Meal, sequelize } = require('../models');
const logger = require('../utils/logger');

/**
 * 初始化菜品数据
 */
async function initMeals() {
  try {
    // 检查是否已有数据
    const existingMeals = await Meal.count();
    if (existingMeals > 0) {
      logger.info(`数据库中已有 ${existingMeals} 条菜品记录，跳过初始化`);
      return;
    }
    
    // 默认菜品数据
    const defaultMeals = [
      {
        name_zh: '一菜套餐',
        name_en: 'One Dish Combo',
        desc_zh: '精选一菜',
        desc_en: 'Selected One Dish',
        price: 15.00,
        category: '主食套餐',
        icon: '🍱',
        is_active: true,
        sort_order: 1
      },
      {
        name_zh: '两菜套餐',
        name_en: 'Two Dish Combo',
        desc_zh: '精选两菜',
        desc_en: 'Selected Two Dishes',
        price: 25.00,
        category: '主食套餐',
        icon: '🍲',
        is_active: true,
        sort_order: 2
      }
    ];
    
    // 批量创建
    await Meal.bulkCreate(defaultMeals);
    
    logger.info(`成功初始化 ${defaultMeals.length} 条菜品数据`);
  } catch (error) {
    logger.error('初始化菜品数据失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      await initMeals();
      process.exit(0);
    } catch (error) {
      console.error('初始化失败:', error);
      process.exit(1);
    }
  })();
}

module.exports = { initMeals };
