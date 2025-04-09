import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

interface DatabaseConfig {
  [key: string]: {
    url: string;
    dialect: Dialect;
    logging: boolean;
    dialectOptions?: {
      ssl?: {
        require: boolean;
        rejectUnauthorized: boolean;
      };
    };
  };
}

const config: DatabaseConfig = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stock_live',
    dialect: 'postgres',
    logging: true
  },
  test: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stock_live_test',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL || '',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

export default config;