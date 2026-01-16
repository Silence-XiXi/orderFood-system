const { Settings, sequelize } = require('../models');
const logger = require('../utils/logger');

/**
 * 初始化系统设置
 */
async function initSettings() {
  try {
    // 默认设置数据
    const defaultSettings = [
      {
        key: 'store_id',
        value: JSON.stringify(1),
        description: '店铺ID',
        category: 'store'
      },
      {
        key: 'store_name',
        value: JSON.stringify('默认店铺'),
        description: '店铺名称',
        category: 'store'
      },
      {
        key: 'store_address',
        value: JSON.stringify(''),
        description: '店铺地址',
        category: 'store'
      },
      {
        key: 'store_phone',
        value: JSON.stringify(''),
        description: '店铺电话',
        category: 'store'
      },
      {
        key: 'sync_enabled',
        value: JSON.stringify(false),
        description: '是否启用云端同步',
        category: 'sync'
      },
      {
        key: 'sync_url',
        value: JSON.stringify(''),
        description: '云端同步API地址',
        category: 'sync'
      },
      {
        key: 'sync_interval',
        value: JSON.stringify(60),
        description: '同步间隔（分钟）',
        category: 'sync'
      },
      {
        key: 'sync_api_key',
        value: JSON.stringify(''),
        description: '云端同步API密钥',
        category: 'sync'
      },
      {
        key: 'last_sync_time',
        value: JSON.stringify(null),
        description: '最后同步时间',
        category: 'sync'
      }
    ];
    
    // 检查并创建设置
    for (const setting of defaultSettings) {
      const [settingRecord, created] = await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
      
      if (created) {
        logger.info(`创建设置: ${setting.key} = ${setting.value}`);
      }
    }
    
    logger.info('系统设置初始化完成');
  } catch (error) {
    logger.error('初始化系统设置失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      await initSettings();
      process.exit(0);
    } catch (error) {
      console.error('初始化失败:', error);
      process.exit(1);
    }
  })();
}

module.exports = { initSettings };
