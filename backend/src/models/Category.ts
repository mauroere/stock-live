import { Model, DataTypes, Sequelize } from 'sequelize';
import { StoreConfig } from './StoreConfig';
import { Product } from './Product';

interface CategoryAttributes {
  id: number;
  tiendanubeCategoryId: string | number;
  storeConfigId: number;
  name: string;
}

interface CategoryCreationAttributes extends Omit<CategoryAttributes, 'id'> {}

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public tiendanubeCategoryId!: string | number;
  public storeConfigId!: number;
  public name!: string;

  public static initModel(sequelize: Sequelize): void {
    Category.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      tiendanubeCategoryId: {
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
      }
    }, {
      sequelize,
      tableName: 'categories',
      indexes: [
        {
          unique: true,
          fields: ['tiendanubeCategoryId', 'storeConfigId'],
          name: 'categories_tiendanube_id_store_config_id_unique'
        }
      ]
    });
  }

  public static associate(): void {
    Category.belongsTo(StoreConfig, {
      foreignKey: 'storeConfigId',
      as: 'storeConfig'
    });

    Category.hasMany(Product, {
      foreignKey: 'categoryTiendanubeId',
      sourceKey: 'tiendanubeCategoryId',
      as: 'products'
    });
  }
}