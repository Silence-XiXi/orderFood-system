const { DataTypes } = require('sequelize');

/**
 * 菜品模型
 */
module.exports = (sequelize) => {
  const Meal = sequelize.define('meals', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name_zh: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '中文名称'
    },
    name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '英文名称'
    },
    desc_zh: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '中文描述'
    },
    desc_en: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '英文描述'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '价格'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '分类（如：主食套餐、小食、饮品等）'
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '图片URL'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序顺序'
    }
  }, {
    sequelize,
    tableName: 'meals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_meals_category',
        fields: ['category']
      },
      {
        name: 'idx_meals_is_active',
        fields: ['is_active']
      },
      {
        name: 'idx_meals_sort_order',
        fields: ['sort_order']
      }
    ]
  });

  return Meal;
};
