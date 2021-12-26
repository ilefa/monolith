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

import { RedisClient } from 'redis';
import { AsyncRedisClient } from '.';

export type StashPreferences<K, T> = {
    host?: string;
    port?: number;
    auth?: boolean;
    password?: string;
    database?: number;
    expiry?: number;
    keyspace: StashKeyspace<K>;
    serializers: {
        resultTransformer: (val: string) => T;
        typeTransformer: (result: T) => string;
    }
}

export type StashKeyspace<K> = {
    prefix: string;
    delimiter: string;
    serialize: (val: K) => string;
    deserialize: (val: string) => K;
}

export class Stash<K, T> {

    private prefix: string;
    private delimiter: string;
    private redis: AsyncRedisClient;

    constructor(public opts: StashPreferences<K, T>, public client?: RedisClient) {
        this.opts = opts;
        this.prefix = opts.keyspace.prefix;
        this.delimiter = opts.keyspace.delimiter;
        this.redis = new AsyncRedisClient(opts, client);
    }

    private makeKey = (key: K) => `${this.prefix + this.delimiter + this.opts.keyspace.serialize(key)}`;
    private selectAll = () => `${this.prefix + this.delimiter}*`;

    /**
     * Retrieves a cached item of type T
     * using the provided key, of type K.
     *
     * @param key the key mapped to the cached object.
     * @return the cached object
     */
    retrieve = async (key: K) => {
        let path = this.makeKey(key);
        let result = await this.redis.get(path);
        if (!result) {
            return null;
        }

        return this
            .opts
            .serializers
            .resultTransformer(result);
    }
    
    /**
     * Retrieves a cached item of type T using the provided key, of type K.
     * If the retrieved item could not be found, an alternative item, also of
     * type T, will be returned in it's place.
     *
     * @param key the key mapped to the cached object.
     * @param orElse the value to return if the cached element does not exist.
     * @return the cached object, or if it does not exist, an alternate object.
     */
    retrieveOrElse = async (key: K, orElse: T) => {
        let remote = await this.retrieve(key);
        if (!remote) {
            return orElse;
        }

        return remote;
    }
    
    /**
     * Retrieves a cached item of type T using the provided key, of type K.
     * If the retrieved item could not be found, the second parameter, also of type T
     * will be assigned to the specified key instead.
     *
     * @param key the key mapped to the cached object.
     * @param newValue the value to store if the element is not present.
     * @return the cached object, or if it does not exist, the alternate object.
     */
    retrieveOrSet = async (key: K, newValue: T) => {
        let remote = await this.retrieve(key);
        if (!remote) {
            return this.store(key, newValue);
        }

        return remote;
    }
    
    /**
     * Retrieves all cached elements.
     * @return all cached elements
     */
    retrieveAll = async () => {
        let path = this.selectAll();
        let results = await this.redis.keys(path);
        if (!results) {
            return null;
        }

        return Promise
            .all(results
                .map(async key => {
                    let realKey = this
                        .opts
                        .keyspace
                        .deserialize(key);

                    return {
                        key: realKey,
                        value: await this.retrieve(realKey)
                    }
                }))
    }
    
    /**
     * Stores (and updates if found) an object of type T
     * using the provided key of type K.
     *
     * @param key the key used to retrieve the object
     * @param element the object to cache
     * @return the cached object
     */
    store = async (key: K, element: T) => {
        this.redis.setex(this.makeKey(key), this.opts.expiry, this.opts.serializers.typeTransformer(element));
        return element;
    }
    
    /**
     * Updates a cached value (if found) in the Stash.
     *
     * @param key the key to update
     * @param element the new value to cache under the key
     * @throws exception thrown if no element exists for the provided key
     * @return the cached object
     */
    update = async (key: K, element: T) => {
        let path = this.makeKey(key);
        if (!await this.redis.exists(path)) {
            throw new Error(`Cannot update absent value for key ${path}`);
        }

        this.redis.setex(path, this.opts.expiry, this.opts.serializers.typeTransformer(element));
        return element;
    }
    
    /**
     * Evicts a cached item by it's key.
     * 
     * @param key the key to evict
     * @return if the element was successfully evicted
     */
    evict = async (key: K) => {
        let path = this.makeKey(key);
        if (!await this.redis.exists(path)) {
            return false;
        }

        let affected = await this.redis.del(path);
        return affected > 0;
    }
    
    /**
     * Evicts all elements that match the specified predicate.
     * @param predicate the condition to meet for eviction
     */
    evictIf = async (predicate: (key: K, element: T) => boolean) =>
        (await this.retrieveAll())
            .filter(_ => predicate(_.key, _.value))
            .forEach(_ => this.evict(_.key));
    
    /**
     * Evicts all cached elements.
     */
    evictAll = async () => this.evictIf((_k, _v) => true);
    
    /**
     * Returns whether or not the specified key refers to an element that is present in the cache.
     * 
     * @param key the provided key
     * @return if an element with such key is present in the cache
     */
    contains = async (key: K) => await this.redis.exists(this.opts.keyspace.serialize(key));

}