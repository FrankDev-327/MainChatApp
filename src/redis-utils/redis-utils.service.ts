import Redis from 'ioredis';
import { LoggerPrint } from '../logger/logger.print';
import { Injectable } from '@nestjs/common';


@Injectable()
export class RedisUtilsService {
    constructor(
        private readonly redis: Redis,
        private loggerPrint: LoggerPrint) {

        this.loggerPrint = new LoggerPrint(RedisUtilsService.name);
    }

    async ping(): Promise<any> {
        return this.redis.ping();
    }

    async connectRedisServer(): Promise<void> {
        this.redis.on('connect', () => {
            this.loggerPrint.log('Connected to Redis server');
        });
    }

    async addMembers(key:string, data): Promise<void> {
        try {
            await this.redis.sadd(key, JSON.stringify(data));
        } catch (error) {
             this.loggerPrint.error(error);
        }
    }

    async getAllAddedMembers(key:string): Promise<any> {
        return await this.redis.smembers(key);
    }

    async setHashExpireTimeOrNot(key: string, data, ttl: number = 400, checkTll = false): Promise<void> {
        try {
            const json = JSON.stringify(data);
            if (checkTll) {
                await this.redis.set(key, json);
            } else {
                await this.redis.setex(key, ttl, json);
            }
        } catch (error) {
            this.loggerPrint.error(error);
        }
    }

    async getValueByKeyName(keyName: string): Promise<any | null> {
        return await this.redis.get(keyName);
    }

    async getListHash(key: string): Promise<any | null> {
        const raw = await this.redis.get(key);
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch (e) {
            this.loggerPrint.error('Redis JSON parse error:', e);
            return null;
        }
    }

    async existKey(keyName: string): Promise<number> {
        try {
            return await this.redis.exists(keyName);
        } catch (error) {
            this.loggerPrint.error(error);
            return 0;

        }
    }

    async deleteSetDataByKeyName(keyNames: string[]): Promise<void> {
        try {
            await this.redis.del(...keyNames);
        } catch (error) {
            this.loggerPrint.error(error);
        }
    }

    async publishingMessage(channel: string, message: string): Promise<void> {
        try {
            await this.redis.publish(channel, JSON.stringify(message));
            this.loggerPrint.log(`Message published to channel ${channel}: ${message}`);
        } catch (error) {
            this.loggerPrint.error(error);
        }
    }
}
