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
        key: 'store_number',
        value: JSON.stringify('001'),
        description: '分店编号（3位数字，001-999）',
        category: 'store'
      },
      {
        key: 'store_name_zh',
        value: JSON.stringify('默认店铺'),
        description: '店铺名称（中文）',
        category: 'store'
      },
      {
        key: 'store_name_en',
        value: JSON.stringify('Default Store'),
        description: '店铺名称（英文）',
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
      },
      {
        key: 'daily_dine_in_sequence',
        value: JSON.stringify(0),
        description: '当日堂食序号',
        category: 'order'
      },
      {
        key: 'daily_takeout_sequence',
        value: JSON.stringify(0),
        description: '当日外卖序号',
        category: 'order'
      },
      {
        key: 'daily_sequence_date',
        value: JSON.stringify(null),
        description: '当日序号对应的日期（YYYY-MM-DD），用于判断是否需要重置',
        category: 'order'
      }
    ];
    
    // 数据迁移：将旧的 store_name 迁移到 store_name_zh
    try {
      const oldStoreName = await Settings.findOne({ where: { key: 'store_name' } });
      if (oldStoreName) {
        // 检查 store_name_zh 是否已存在
        const storeNameZh = await Settings.findOne({ where: { key: 'store_name_zh' } });
        if (!storeNameZh) {
          // 创建 store_name_zh，使用旧 store_name 的值
          await Settings.create({
            key: 'store_name_zh',
            value: oldStoreName.value,
            description: '店铺名称（中文）',
            category: 'store'
          });
          logger.info(`✓ 已迁移 store_name 到 store_name_zh`);
        }
        // 删除旧的 store_name
        await oldStoreName.destroy();
        logger.info(`✓ 已删除旧的 store_name 设置项`);
      }
    } catch (migrationError) {
      logger.warn('迁移 store_name 设置项时出错:', migrationError.message);
    }
    
    // 检查并创建设置
    let createdCount = 0;
    let existingCount = 0;
    
    for (const setting of defaultSettings) {
      const [settingRecord, created] = await Settings.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
      
      if (created) {
        createdCount++;
        logger.info(`✓ 创建设置: ${setting.key} = ${setting.value}`);
      } else {
        existingCount++;
        logger.debug(`设置已存在: ${setting.key}`);
      }
    }
    
    if (createdCount > 0) {
      logger.info(`系统设置初始化完成：新增 ${createdCount} 个设置项，已有 ${existingCount} 个设置项`);
    } else {
      logger.info(`系统设置初始化完成：所有设置项已存在（共 ${existingCount} 个）`);
    }
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
