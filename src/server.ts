import { Server } from "http";
import { prisma } from "./app/lib/prisma";
import { app } from "./app";
import { seedAdmin } from "./app/shared/seedAdmin";
import { setupSocket, setIoInstance } from "./app/lib/socket";
import { setupVideoNamespace } from "./app/socket/videoNamespace";
import { connectRedis } from "./app/lib/redis";
import { logger } from "./app/lib/logger";



process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err)
  process.exit(1)
})

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err)
  process.exit(1)
})

let server: Server

export async function StartServer() {
    try {
        await prisma.$connect()
        logger.info("Database connected successfully")
        await connectRedis()
        logger.info("Redis connected successfully")
        const httpServer = new Server(app);
        const io = setupSocket(httpServer);
        setIoInstance(io);
        setupVideoNamespace(io);

        const requestedPort = process.env.PORT && process.env.PORT !== "" ? Number(process.env.PORT) : 5000;
        const PORT = Number.isNaN(requestedPort) ? 5000 : requestedPort;
        server = httpServer.listen(PORT, "0.0.0.0", () => {
            logger.info({ port: PORT }, "Server is running on port " + PORT)
        })
    } catch (error) {
        logger.fatal({ err: error }, "Error starting the server")
        process.exit(1)
    }
}

(async () => {
    await StartServer()
    await seedAdmin()
})()

process.on("SIGTERM", (err) => {
    logger.warn("SIGTERM received, shutting down gracefully...")
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

process.on("unhandledRejection", (err) => {
    logger.error({ err }, "unhandledRejection is detected, shutting down the server")
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})
process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaughtException is detected, shutting down the server")
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})