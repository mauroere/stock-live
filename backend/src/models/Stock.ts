import { Model, DataTypes, Sequelize } from 'sequelize';

interface StockAttributes {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

class Stock extends Model<StockAttributes> implements StockAttributes {
  public id!: number;
  public symbol!: string;
  public name!: string;
  public currentPrice!: number;
  public dayHigh!: number;
  public dayLow!: number;
  public volume!: number;
  public marketCap!: number;
  public lastUpdated!: Date;

  static associate(models: any) {
    // Define associations here
  }
}

export const initStock = (sequelize: Sequelize) => {
  Stock.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    currentPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dayHigh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dayLow: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    volume: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    marketCap: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stocks',
    timestamps: true
  });

  return Stock;
};

export default Stock;