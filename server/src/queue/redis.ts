import { Redis } from 'ioredis';
import { env } from '../config/index.js';

let redisInstance: Redis | null = null;
let isRedisConnected = false;

export function getRedisClient(): Redis | null {
  if (!redisInstance) {
    try {
      redisInstance = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy(times: number) {
          if (times > 3) {
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });

      redisInstance.on('connect', () => {
        isRedisConnected = true;
        console.log('✅ Redis conectado com sucesso.');
      });

      redisInstance.on('error', (_err: Error) => {
        isRedisConnected = false;
      });
    } catch (e: any) {
      console.warn('⚠️ Não foi possível instanciar cliente Redis:', e.message);
    }
  }
  return redisInstance;
}

export function isRedisAvailable(): boolean {
  return isRedisConnected;
}
