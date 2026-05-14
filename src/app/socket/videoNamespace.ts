import { Server, Socket } from 'socket.io';


export const setupVideoNamespace = (io: Server) => {
  const videoNamespace = io.of('/video');

  videoNamespace.on('connection', (socket: Socket) => {
    console.log('User connected to video namespace:', socket.id);

    socket.on('join-room', async ({ bookingId }: { bookingId: string }) => {
      socket.join(`room:${bookingId}`);
      console.log(`User ${socket.id} joined room:${bookingId}`);
      videoNamespace.to(`room:${bookingId}`).emit('participant-joined', { userId: socket.id });
    });

    socket.on('chat-message', ({ bookingId, message }: { bookingId: string, message: string }) => {
      if (message.length > 1000) return;

      const payload = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: socket.id,
        senderName: 'User',
        message,
        timestamp: new Date().toISOString(),
      };

      videoNamespace.to(`room:${bookingId}`).emit('chat-message', payload);
    });

    socket.on('raise-hand', ({ bookingId, raised }: { bookingId: string, raised: boolean }) => {
      videoNamespace.to(`room:${bookingId}`).emit('hand-raised', {
        userId: socket.id,
        userName: 'User',
        raised,
      });
    });

    socket.on('session-ended', ({ bookingId }: { bookingId: string }) => {
      videoNamespace.to(`room:${bookingId}`).emit('session-ended', {
        message: 'The session has been ended by the mentor.',
        endedAt: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from video namespace:', socket.id);
    });
  });
};
