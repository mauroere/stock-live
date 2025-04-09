import { Model, DataTypes, Sequelize } from 'sequelize';
import { StoreConfig } from './StoreConfig';

interface OrderAttributes {
  id: number;
  tiendanubeOrderId: string | number;
  storeConfigId: number;
  total: number;
  subtotal: number;
  paymentStatus: string;
  shippingStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  createdAtApi: Date;
  localUpdatedAt: Date;
}

interface OrderCreationAttributes extends Omit<OrderAttributes, 'id' | 'localUpdatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public tiendanubeOrderId!: string | number;
  public storeConfigId!: number;
  public total!: number;
  public subtotal!: number;
  public paymentStatus!: string;
  public shippingStatus!: string;
  public paymentMethod!: string;
  public customerName!: string;
  public customerEmail!: string;
  public createdAtApi!: Date;
  public localUpdatedAt!: Date;

  public static initModel(sequelize: Sequelize): void {
    Order.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      tiendanubeOrderId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      storeConfigId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'store_configs',
          key: 'id'
        }
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingStatus: {
        type: DataTypes.STRING,
        allowNull: false
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customerEmail: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdAtApi: {
        type: DataTypes.DATE,
        allowNull: false
      },
      localUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    }, {
      sequelize,
      tableName: 'orders',
      indexes: [
        {
          unique: true,
          fields: ['tiendanubeOrderId', 'storeConfigId'],
          name: 'orders_tiendanube_id_store_config_id_unique'
        },
        {
          fields: ['createdAtApi'],
          name: 'orders_created_at_api_index'
        }
      ]
    });
  }

  public static associate(): void {
    Order.belongsTo(StoreConfig, {
      foreignKey: 'storeConfigId',
      as: 'storeConfig'
    });
  }
}