import { Model, DataTypes, Sequelize } from 'sequelize';
import crypto from 'crypto';
import { User } from './User';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const IV_LENGTH = 16;

// Funciones de encriptación y desencriptación
const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text: string): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() || '', 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

class StoreConfiguration extends Model {
  public id!: string;
  public userId!: string;
  public tiendanubeStoreId!: string;
  public tiendanubeApiKey!: string;
  public tiendanubeAccessToken!: string;
  public storeName?: string;
  public lowStockThresholdValue!: number;
  public lowStockThresholdType!: 'UNIT' | 'DAYS';
  public overStockThresholdValue!: number;
  public overStockThresholdType!: 'DAYS';
  public lastSyncStatus!: 'PENDING' | 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  public lastSyncAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para obtener las credenciales desencriptadas
  public getDecryptedCredentials() {
    return {
      apiKey: decrypt(this.tiendanubeApiKey),
      accessToken: decrypt(this.tiendanubeAccessToken)
    };
  }
}

export const initStoreConfiguration = (sequelize: Sequelize) => {
  StoreConfiguration.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    tiendanubeStoreId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tiendanubeApiKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value: string) {
        this.setDataValue('tiendanubeApiKey', encrypt(value));
      }
    },
    tiendanubeAccessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value: string) {
        this.setDataValue('tiendanubeAccessToken', encrypt(value));
      }
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lowStockThresholdValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    lowStockThresholdType: {
      type: DataTypes.ENUM('UNIT', 'DAYS'),
      allowNull: false,
      defaultValue: 'UNIT'
    },
    overStockThresholdValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90
    },
    overStockThresholdType: {
      type: DataTypes.ENUM('DAYS'),
      allowNull: false,
      defaultValue: 'DAYS'
    },
    lastSyncStatus: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'IN_PROGRESS'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'StoreConfiguration',
    tableName: 'store_configurations'
  });

  StoreConfiguration.associate = (models: any) => {
    StoreConfiguration.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return StoreConfiguration;
};