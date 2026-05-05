
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../shared/jwt";
import { envVar } from "../config/envVar";
import { prisma } from "./prisma";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient } from "./redis";

// Use Redis for online status instead of in-memory Map
export const getOnlineUser = async (userId: string) => {
  return await pubClient.get(`online_user:${userId}`);
};

export const setOnlineUser = async (userId: string, socketId: string) => {
  await pubClient.set(`online_user:${userId}`, socketId);
};

export const removeOnlineUser = async (userId: string) => {
  await pubClient.del(`online_user:${userId}`);
};

export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    adapter: createAdapter(pubClient, subClient),
  });

  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyToken(token as string, envVar.JWT_ACCESS_SECRET);
      if (!decoded) {
        return next(new Error("Authentication error: Invalid token"));
      }

      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    const userId = user.id;

    console.log(`User connected: ${userId} (${socket.id})`);

    // Track online presence in Redis
    setOnlineUser(userId, socket.id);
    io.emit("online_status", { userId, status: "online" });

    // Join personal room
    socket.join(`user_${userId}`);

    // Join discussion rooms
    socket.on("join_discussion", (discussionId: string) => {
      socket.join(`discussion_${discussionId}`);
      console.log(`User ${userId} joined discussion ${discussionId}`);
    });

    // Join booking rooms
    socket.on("join_booking", (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${userId} joined booking ${bookingId}`);
    });


    socket.on("send_message", async (data: { discussionId: string; content: string }) => {
      try {
        const message = await prisma.chatMessage.create({
          data: {
            discussionId: data.discussionId,
            content: data.content,
            senderId: userId,
            senderName: user.name || "Anonymous",
          },
        });

        // Broadcast to the discussion room
        io.to(`discussion_${data.discussionId}`).emit("new_message", message);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", async () => {
      await removeOnlineUser(userId);
      io.emit("online_status", { userId, status: "offline" });
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

// Global io instance helper
let ioInstance: Server;
export const setIoInstance = (io: Server) => {
  ioInstance = io;
};

export const getIoInstance = () => ioInstance;

export const emitToUser = (userId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(event, data);
  }
};
