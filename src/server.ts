import { Server } from "http";
import { prisma } from "./app/lib/prisma";
import { app } from "./app";
import { seedAdmin } from "./app/shared/seedAdmin";
import { setupSocket, setIoInstance } from "./app/lib/socket";
import { setupVideoNamespace } from "./app/socket/videoNamespace";
import { connectRedis } from "./app/lib/redis";
import { logger } from "./app/lib/logger";



let server: Server

export async function StartServer() {
    try {
        await prisma.$connect()
        logger.info("Database connected successfully")
        await connectRedis()
        const httpServer = new Server(app);
        const io = setupSocket(httpServer);
        setIoInstance(io);
        setupVideoNamespace(io);


        server = httpServer.listen(process.env.ENV_PORT, () => {
            logger.info({ port: process.env.ENV_PORT }, "Server is running")
        })
    } catch (error) {
        logger.fatal({ err: error }, "Error starting the server")
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