
import { createClient } from "redis";
import { envVar } from "../config/envVar";
import { logger } from "./logger";

export const redisClient = createClient({
  url: envVar.REDIS_URL,
});

export const pubClient = redisClient;
export const subClient = pubClient.duplicate();

redisClient.on("error", (err) => logger.error({ err }, "Redis Client Error"));
subClient.on("error", (err) => logger.error({ err }, "Redis Sub Client Error"));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await Promise.all([redisClient.connect(), subClient.connect()]);
    logger.info("Connected to Redis (Pub/Sub)");
  }
};
