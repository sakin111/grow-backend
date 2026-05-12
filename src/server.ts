import { Server } from "http";
import { prisma } from "./app/lib/prisma";
import { app } from "./app";
import { seedAdmin } from "./app/shared/seedAdmin";
import { setupSocket, setIoInstance } from "./app/lib/socket";
import { setupVideoNamespace } from "./app/socket/videoNamespace";
import { connectRedis } from "./app/lib/redis";



let server: Server

export async function StartServer() {
    try {
        await prisma.$connect()
        console.log("Database connected successfully")
        await connectRedis()
        const httpServer = new Server(app);
        const io = setupSocket(httpServer);
        setIoInstance(io);
        setupVideoNamespace(io);


        server = httpServer.listen(process.env.ENV_PORT, () => {
            console.log(`Server is running on port ${process.env.ENV_PORT}`)
        })
    } catch (error) {
        console.error("Error starting the server:", error)
    }
}

(async () => {
    await StartServer()
    await seedAdmin()
})()

process.on("SIGTERM", (err) => {
    console.log("SIGTERM received, shutting down gracefully...")
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

process.on("unhandledRejection", (err) => {
    console.log("unhandledRejection is detected, shutting down the server", err)
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})
process.on("uncaughtException", (err) => {
    console.log("uncaughtException is detected, shutting down the server", err)
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})