const { DataTypes } = require('sequelize');

/**
 * 系统设置模型
 * 存储店铺配置信息
 */
module.exports = (sequelize) => {
  const Settings = sequelize.define('settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '设置键名'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '设置值（JSON字符串）'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '设置描述'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'general',
      comment: '设置分类：store(店铺信息), sync(云端同步), system(系统设置)'
    }
  }, {
    sequelize,
    tableName: 'settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_settings_key',
        unique: true,
        fields: ['key']
      },
      {
        name: 'idx_settings_category',
        fields: ['category']
      }
    ]
  });

  return Settings;
};
