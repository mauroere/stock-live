import { Model, DataTypes, Sequelize } from 'sequelize';
import { Order } from './Order';
import { Product } from './Product';

interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  tiendanubeProductId: string | number;
  tiendanubeVariantId?: string | number;
  quantity: number;
  price: number;
}

interface OrderItemCreationAttributes extends Omit<OrderItemAttributes, 'id'> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public tiendanubeProductId!: string | number;
  public tiendanubeVariantId?: string | number;
  public quantity!: number;
  public price!: number;

  public static initModel(sequelize: Sequelize): void {
    OrderItem.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        }
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      tiendanubeProductId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tiendanubeVariantId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'order_items',
      indexes: [
        {
          fields: ['orderId'],
          name: 'order_items_order_id_index'
        },
        {
          fields: ['productId'],
          name: 'order_items_product_id_index'
        },
        {
          fields: ['tiendanubeProductId'],
          name: 'order_items_tiendanube_product_id_index'
        }
      ]
    });
  }

  public static associate(): void {
    OrderItem.belongsTo(Order, {
      foreignKey: 'orderId',
      as: 'order'
    });

    OrderItem.belongsTo(Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  }
}