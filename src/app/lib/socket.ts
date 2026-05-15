
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../shared/jwt";
import { envVar } from "../config/envVar";
import { prisma } from "./prisma";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient } from "./redis";
import { logger } from "./logger";

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

    logger.info({ userId, socketId: socket.id }, "User connected");

    // Track online presence in Redis
    setOnlineUser(userId, socket.id);
    io.emit("online_status", { userId, status: "online" });

    // Join personal room
    socket.join(`user_${userId}`);

    // Join discussion rooms
    socket.on("join_discussion", (discussionId: string) => {
      socket.join(`discussion_${discussionId}`);
      logger.debug({ userId, discussionId }, "User joined discussion");
    });

    // Join booking rooms
    socket.on("join_booking", (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
      logger.debug({ userId, bookingId }, "User joined booking");
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
        logger.error({ err: error, userId, discussionId: data.discussionId }, "Error saving message");
      }
    });

    // --- WebRTC Signaling ---
    
    // Join a video session room
    socket.on("join_video_session", (bookingId: string) => {
      socket.join(`video_${bookingId}`);
      logger.info({ userId, bookingId }, "User joined video session");
      
      // Notify others in the room that a new peer joined
      socket.to(`video_${bookingId}`).emit("peer_joined", { userId });
    });

    // Relay signaling data (offer, answer, ICE candidates)
    socket.on("webrtc_signal", (data: { targetId: string; signal: any; bookingId: string }) => {
      logger.debug({ userId, targetId: data.targetId }, "Relaying WebRTC signal");
      io.to(`user_${data.targetId}`).emit("webrtc_signal", {
        senderId: userId,
        signal: data.signal,
        bookingId: data.bookingId
      });
    });

    // Handle leaving video session
    socket.on("leave_video_session", (bookingId: string) => {
      socket.leave(`video_${bookingId}`);
      logger.info({ userId, bookingId }, "User left video session");
      socket.to(`video_${bookingId}`).emit("peer_left", { userId });
    });

    socket.on("disconnect", async () => {
      await removeOnlineUser(userId);
      io.emit("online_status", { userId, status: "offline" });
      logger.info({ userId }, "User disconnected");
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
