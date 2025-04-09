import { Sequelize } from 'sequelize';
import config from '../config/database';
import { initStock } from './Stock';
import { initUser } from './User';
import { initStoreConfiguration } from './StoreConfiguration';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  dialectOptions: dbConfig.dialectOptions
});

// Inicializar modelos
const models = {
  Stock: initStock(sequelize),
  User: initUser(sequelize),
  StoreConfiguration: initStoreConfiguration(sequelize)
};

// Establecer asociaciones entre modelos
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;