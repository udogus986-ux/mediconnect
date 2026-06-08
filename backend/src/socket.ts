import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/messages';
import Conversation from './models/conversation';
import User from './models/user';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initSocket = (io: Server) => {

  // Her bağlantıda token doğrula
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token gerekli'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Token geçersiz'));
    }
  });

  io.on('connection', async (socket: AuthSocket) => {
    console.log(`🔌 ${socket.userId} bağlandı`);

    // Kullanıcıyı online yap
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });
    io.emit('userOnline', socket.userId);

    // Kullanıcıyı kendi odasına al
    socket.join(socket.userId!);

    // Konuşma odasına katıl
    socket.on('joinConversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`${socket.userId} → ${conversationId} odasına katıldı`);
    });

    // Mesaj gönder
    socket.on('sendMessage', async (data: {
      conversationId: string;
      content: string;
      type?: 'text' | 'image' | 'file';
      fileUrl?: string;
      fileName?: string;
    }) => {
      try {
        const { conversationId, content, type = 'text', fileUrl, fileName } = data;

        // Mesajı veritabanına kaydet
        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          content,
          type,
          fileUrl,
          fileName,
        });

        // Konuşmanın son mesajını güncelle
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        // Mesajı populate et
        const populated = await message.populate('sender', 'name avatar role');

        // Konuşma odasındaki herkese gönder
        io.to(conversationId).emit('newMessage', populated);

      } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
      }
    });

    // Yazıyor göstergesi
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(data.conversationId).emit('userTyping', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Bağlantı kesilince
    socket.on('disconnect', async () => {
      console.log(`❌ ${socket.userId} ayrıldı`);
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      io.emit('userOffline', socket.userId);
    });
  });
};