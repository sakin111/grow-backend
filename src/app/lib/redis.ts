
import { createClient } from "redis";
import { envVar } from "../config/envVar";
import { logger } from "./logger";

const reconnectStrategy = (retries: number) => Math.min(100 * Math.pow(2, retries), 30000);

let redisUrl = envVar.REDIS_URL;
// If Upstash provides a redis:// URL, force secure scheme to rediss:// to match TLS
if (/upstash\.io/.test(redisUrl) && redisUrl.startsWith("redis://")) {
  redisUrl = redisUrl.replace(/^redis:\/\//, "rediss://");
}

const socketTls = redisUrl.startsWith("rediss://");

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy,
    ...(socketTls ? { tls: true } : {}),
  },
});

export const pubClient = redisClient;
export const subClient = pubClient.duplicate();

const attachListeners = (client: any, name: string) => {
  client.on("error", (err: any) => logger.error({ err }, `${name} Error`));
  client.on("end", () => logger.warn(`${name} connection ended`));
  client.on("connect", () => logger.info(`${name} socket connected`));
  client.on("ready", () => logger.info(`${name} ready`));
  // Some redis client versions emit 'reconnecting' with a delay
  // include a handler to surface that information when available
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  client.on("reconnecting", (delay: number) => logger.warn({ delay }, `${name} reconnecting`));
};

attachListeners(redisClient, "Redis Client");
attachListeners(subClient, "Redis Sub Client");

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await Promise.all([redisClient.connect(), subClient.connect()]);
      logger.info("Connected to Redis (Pub/Sub)");
    } catch (err) {
      logger.error({ err }, "Failed to connect to Redis; client will use reconnect strategy");
    }
  }
};
