import pino from "pino";
import { envVar } from "../config/envVar";


export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(envVar.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});
