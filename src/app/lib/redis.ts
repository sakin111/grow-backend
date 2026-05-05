
import { createClient } from "redis";
import { envVar } from "../config/envVar";

export const redisClient = createClient({
  url: envVar.REDIS_URL,
});

export const pubClient = redisClient;
export const subClient = pubClient.duplicate();

redisClient.on("error", (err) => console.error("Redis Client Error", err));
subClient.on("error", (err) => console.error("Redis Sub Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await Promise.all([redisClient.connect(), subClient.connect()]);
    console.log("Connected to Redis (Pub/Sub)");
  }
};
