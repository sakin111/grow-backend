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
        
        try {
            await connectRedis()
        } catch (err) {
            logger.warn({ err }, "Redis connection failed, continuing without Redis")
        }

        const httpServer = new Server(app);
        const io = setupSocket(httpServer);
        setIoInstance(io);
        setupVideoNamespace(io);

        const PORT = Number(process.env.PORT) || 5000;
        server = httpServer.listen(PORT, () => {
            logger.info({ port: PORT }, "Server is running")
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

process.on("SIGTERM", () => {
    logger.warn("SIGTERM received, shutting down gracefully...")
    if (server) server.close(() => process.exit(0))
})

process.on("unhandledRejection", (err) => {
    logger.error({ err }, "unhandledRejection detected")
    if (server) server.close(() => process.exit(1))
    else process.exit(1)
})

process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaughtException detected")
    if (server) server.close(() => process.exit(1))
    else process.exit(1)
})