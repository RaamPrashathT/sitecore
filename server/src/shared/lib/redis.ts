import {createClient} from 'redis'

const redis = createClient({
    url: 'redis://localhost:6379' 
});

redis.on('error', (err) => console.log('Redis Client Error', err));

export default redis;

await redis.connect();