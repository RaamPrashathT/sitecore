import { createClient } from 'redis';
import { env } from '../config/env.js';

const redis = createClient({
    url: env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false
    }
});

redis.on('error', (err) => console.log('Redis Client Error', err));


(async () => {
    await redis.connect();
    console.log('Connected to Redis successfully');
})();

export default redis;