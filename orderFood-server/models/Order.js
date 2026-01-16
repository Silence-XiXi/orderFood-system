const { DataTypes } = require('sequelize');

/**
 * 订单模型
 */
module.exports = (sequelize) => {
  const Order = sequelize.define('orders', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单号'
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: '店铺ID（为多店铺功能预留）'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '订单总金额'
    },
    order_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '订单类型: 0=堂食, 1=外卖'
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '付款方式ID（外键）',
      references: {
        model: 'payment_methods',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '订单状态: pending(待支付), paid(已支付), completed(已完成), cancelled(已取消)'
    },
    print_status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      comment: '打印状态: success, error, null'
    },
    print_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '打印消息'
    }
  }, {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_orders_order_number',
        unique: true,
        fields: ['order_number']
      },
      {
        name: 'idx_orders_store_id',
        fields: ['store_id']
      },
      {
        name: 'idx_orders_status',
        fields: ['status']
      },
      {
        name: 'idx_orders_order_type',
        fields: ['order_type']
      },
      {
        name: 'idx_orders_payment_method_id',
        fields: ['payment_method_id']
      },
      {
        name: 'idx_orders_created_at',
        fields: ['created_at']
      },
      {
        name: 'idx_orders_store_created',
        fields: ['store_id', 'created_at']
      }
    ]
  });

  return Order;
};
