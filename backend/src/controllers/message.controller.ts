import { Request, Response } from 'express';
import Message from '../models/messages';
import Conversation from '../models/conversation';

// KONUŞMALARIMı GETİR
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name avatar isOnline lastSeen role')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// MESAJLARI GETİR
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user.userId;

    // Bu konuşmaya erişim var mı?
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Bu konuşmaya erişim yetkiniz yok' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    // Mesajları okundu olarak işaretle
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// KONUŞMA OLUŞTUR
export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { participantId } = req.body;

    // Zaten var mı?
    const existing = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    }).populate('participants', 'name avatar isOnline role');

    if (existing) {
      return res.status(200).json({ conversation: existing });
    }

    const conversation = await Conversation.create({
      participants: [userId, participantId],
    });

    const populated = await conversation.populate(
      'participants', 'name avatar isOnline role'
    );

    return res.status(201).json({ conversation: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};