import Queue from 'bullmq';
import { Redis } from 'ioredis';

// Configuración de conexión a Redis
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Crear conexión a Redis
export const redisClient = new Redis(redisConnection);

// Crear la cola de sincronización
export const syncQueue = new Queue('syncQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,  // Mantener los últimos 100 jobs completados
    removeOnFail: 200,      // Mantener los últimos 200 jobs fallidos
  },
});

// Función para agregar un job de sincronización
export const addSyncJob = async (storeConfigId: number) => {
  return await syncQueue.add('syncStore', { storeConfigId }, {
    jobId: `sync-store-${storeConfigId}-${Date.now()}`,
  });
};

// Función para agregar un job recurrente
export const addRecurringSyncJob = async (storeConfigId: number) => {
  return await syncQueue.add('syncStore', { storeConfigId }, {
    repeat: {
      pattern: '0 */4 * * *', // Cada 4 horas
    },
    jobId: `sync-store-${storeConfigId}-recurring`,
  });
};