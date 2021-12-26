/*
 * Copyright (c) 2021 ILEFA Labs
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Redis from 'redis';

import { promisify } from 'util';
import { RedisClient } from 'redis';

export type RedisConnection = {
    host?: string;
    port?: number;
    auth?: boolean;
    password?: string;
    database?: number;
}

export class AsyncRedisClient {

    redis: RedisClient;

    del: (...keys: string[]) => Promise<number>;
    exists: (key: string) => Promise<boolean>;
    get: (key: string) => Promise<string>;
    hget: (key: string, prop: string) => Promise<string>;
    hgetall: (key: string) => Promise<string[]>;
    hdel: (key: string, prop: string) => Promise<number>;
    hset: (key: string, prop: string, val: string) => Promise<number>;
    hmset: (key: string, prop: string, val: string, ...rest: string[]) => Promise<number>;
    keys: (pattern: string) => Promise<string[]>;
    sadd: (key: string, ...member: string[]) => Promise<number>;
    set: (key: string, val: string) => Promise<number>;
    setex: (key: string, expiryInSeconds: number, val: string) => Promise<number>;
    srem: (key: string, ...member: string[]) => Promise<number>;
    sismember: (key: string, member: string) => Promise<boolean>;
    smembers: (key: string) => Promise<string[]>;

    constructor(connection: RedisConnection, redis?: RedisClient) {
        this.redis = redis || Redis.createClient({
            host: connection.host,
            port: connection.port,
            db: connection.database,
            auth_pass: connection.auth ? connection.password : undefined,
            socket_keepalive: true
        });

        this.del = promisify(this.redis.del).bind(this.redis);
        this.exists = promisify(this.redis.exists).bind(this.redis);
        this.get = promisify(this.redis.get).bind(this.redis);
        this.hget = promisify(this.redis.hget).bind(this.redis);
        this.hgetall = promisify(this.redis.hgetall).bind(this.redis);
        this.hdel = promisify(this.redis.hdel).bind(this.redis);
        this.hset = promisify(this.redis.hset).bind(this.redis);
        this.hmset = promisify(this.redis.hmset).bind(this.redis);
        this.keys = promisify(this.redis.keys).bind(this.redis);
        this.sadd = promisify(this.redis.sadd).bind(this.redis);
        this.srem = promisify(this.redis.srem).bind(this.redis);
        this.sismember = promisify(this.redis.sismember).bind(this.redis);
        this.smembers = promisify(this.redis.smembers).bind(this.redis);
        this.setex = promisify(this.redis.setex).bind(this.redis);
    }

    static withInstance = (redis: RedisClient) => new AsyncRedisClient(null, redis); 
    
}