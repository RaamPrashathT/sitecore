import { createClient } from 'redis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const redis = createClient({
    url: env.REDIS_URL,

    socket: env.NODE_ENV === 'production' ? {
        tls: true,
        rejectUnauthorized: false
    } : {}
});

redis.on('error', (err) => console.log('Redis Client Error', err));


(async () => {
    await redis.connect();
    logger.info('Connected to Redis successfully');
})();


export default redis;