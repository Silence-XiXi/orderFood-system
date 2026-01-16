const { DataTypes } = require('sequelize');

/**
 * 订单明细模型
 */
module.exports = (sequelize) => {
  const OrderItem = sequelize.define('order_items', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID（外键）',
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    meal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '菜品ID（外键）',
      references: {
        model: 'meals',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '数量'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价（下单时的价格，防止价格变动影响历史订单）'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '小计（quantity * price）'
    }
  }, {
    sequelize,
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_order_items_order_id',
        fields: ['order_id']
      },
      {
        name: 'idx_order_items_meal_id',
        fields: ['meal_id']
      },
      {
        name: 'idx_order_items_order_meal',
        fields: ['order_id', 'meal_id']
      }
    ]
  });

  return OrderItem;
};
