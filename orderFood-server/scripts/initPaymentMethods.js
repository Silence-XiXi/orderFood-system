const { PaymentMethod, sequelize } = require('../models');
const logger = require('../utils/logger');

/**
 * 初始化付款方式数据
 */
async function initPaymentMethods() {
  try {
    // 检查是否已有数据
    const existingMethods = await PaymentMethod.count();
    if (existingMethods > 0) {
      logger.info(`数据库中已有 ${existingMethods} 条付款方式记录，跳过初始化`);
      return;
    }
    
    // 默认付款方式数据
    const defaultPaymentMethods = [
      {
        code: 'wechat',
        name_zh: '微信支付',
        name_en: 'WeChat Pay',
        icon: '💚',
        is_active: true,
        sort_order: 1
      },
      {
        code: 'alipay',
        name_zh: '支付宝',
        name_en: 'Alipay',
        icon: '💙',
        is_active: true,
        sort_order: 2
      },
      {
        code: 'visa',
        name_zh: 'Visa',
        name_en: 'Visa',
        icon: '💳',
        is_active: true,
        sort_order: 3
      },
      {
        code: 'mastercard',
        name_zh: 'Mastercard',
        name_en: 'Mastercard',
        icon: '💳',
        is_active: true,
        sort_order: 4
      },
      {
        code: 'octopus',
        name_zh: '八达通',
        name_en: 'Octopus',
        icon: '🟠',
        is_active: true,
        sort_order: 5
      },
      {
        code: 'cash',
        name_zh: '现金',
        name_en: 'Cash',
        icon: '💵',
        is_active: true,
        sort_order: 6
      }
    ];
    
    // 批量创建
    await PaymentMethod.bulkCreate(defaultPaymentMethods);
    
    logger.info(`成功初始化 ${defaultPaymentMethods.length} 条付款方式数据`);
  } catch (error) {
    logger.error('初始化付款方式数据失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      await initPaymentMethods();
      process.exit(0);
    } catch (error) {
      console.error('初始化失败:', error);
      process.exit(1);
    }
  })();
}

module.exports = { initPaymentMethods };
