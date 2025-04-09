import { Model, DataTypes, Sequelize } from 'sequelize';
import { StoreConfig } from './StoreConfig';

interface ProductAttributes {
  id: number;
  tiendanubeProductId: string | number;
  storeConfigId: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
  cost: number;
  imageUrl?: string;
  categoryTiendanubeId?: string | number;
  isVariant: boolean;
  parentTiendanubeProductId?: string | number;
  createdAtApi: Date;
  updatedAtApi: Date;
  localUpdatedAt: Date;
}

interface ProductCreationAttributes extends Omit<ProductAttributes, 'id' | 'localUpdatedAt'> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public tiendanubeProductId!: string | number;
  public storeConfigId!: number;
  public name!: string;
  public sku!: string;
  public stock!: number;
  public price!: number;
  public cost!: number;
  public imageUrl?: string;
  public categoryTiendanubeId?: string | number;
  public isVariant!: boolean;
  public parentTiendanubeProductId?: string | number;
  public createdAtApi!: Date;
  public updatedAtApi!: Date;
  public localUpdatedAt!: Date;

  public static initModel(sequelize: Sequelize): void {
    Product.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      tiendanubeProductId: {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      categoryTiendanubeId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isVariant: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      parentTiendanubeProductId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAtApi: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAtApi: {
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
      tableName: 'products',
      indexes: [
        {
          unique: true,
          fields: ['tiendanubeProductId', 'storeConfigId'],
          name: 'products_tiendanube_id_store_config_id_unique'
        },
        {
          fields: ['sku'],
          name: 'products_sku_index'
        },
        {
          fields: ['createdAtApi'],
          name: 'products_created_at_api_index'
        }
      ]
    });
  }

  public static associate(): void {
    Product.belongsTo(StoreConfig, {
      foreignKey: 'storeConfigId',
      as: 'storeConfig'
    });
  }
}