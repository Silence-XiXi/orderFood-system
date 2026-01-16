const { DataTypes } = require('sequelize');

/**
 * 付款方式模型
 */
module.exports = (sequelize) => {
  const PaymentMethod = sequelize.define('payment_methods', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '付款方式代码（如：wechat, alipay, visa, octopus）'
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
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '图标（emoji 或图标类名）'
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
    tableName: 'payment_methods',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_payment_methods_code',
        unique: true,
        fields: ['code']
      },
      {
        name: 'idx_payment_methods_is_active',
        fields: ['is_active']
      },
      {
        name: 'idx_payment_methods_sort_order',
        fields: ['sort_order']
      }
    ]
  });

  return PaymentMethod;
};
