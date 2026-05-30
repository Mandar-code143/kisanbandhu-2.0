import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

export class ChatService {
  async createChat(user1Id: string, user2Id: string, jobId?: string) {
    if (user1Id === user2Id) {
      throw ApiError.badRequest("Cannot create chat with yourself");
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
    });

    if (existingChat) {
      return existingChat;
    }

    const [user1, user2] = await Promise.all([
      prisma.user.findUnique({ where: { id: user1Id } }),
      prisma.user.findUnique({ where: { id: user2Id } }),
    ]);

    if (!user1 || !user2) {
      throw ApiError.notFound("User not found");
    }

    const chat = await prisma.chat.create({
      data: {
        user1Id,
        user2Id,
        jobId: jobId || null,
      },
      include: {
        user1: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true } } } },
        user2: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true } } } },
      },
    });

    logger.info(`Chat created: ${chat.id} between ${user1Id} and ${user2Id}`);
    return chat;
  }

  async getUserChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true } } } },
        user2: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true } } } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, senderId: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                readAt: null,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return chats.map((chat) => {
      const otherUser = chat.user1Id === userId ? chat.user2 : chat.user1;
      return {
        id: chat.id,
        otherUser,
        lastMessage: chat.messages[0] || null,
        unreadCount: chat._count.messages,
        jobId: chat.jobId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    });
  }

  async getChatMessages(chatId: string, userId: string, params: { page: number; limit: number }) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw ApiError.forbidden("You are not a participant in this chat");
    }

    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true } } },
          },
        },
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    return {
      data: messages.reverse(),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async sendMessage(chatId: string, senderId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw ApiError.badRequest("Message content is required");
    }

    if (content.length > 5000) {
      throw ApiError.badRequest("Message too long (max 5000 characters)");
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    if (chat.user1Id !== senderId && chat.user2Id !== senderId) {
      throw ApiError.forbidden("You are not a participant in this chat");
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId,
          senderId,
          content,
        },
        include: {
          sender: {
            select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true } } },
          },
        },
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      }),
    ]);

    const receiverId = chat.user1Id === senderId ? chat.user2Id : chat.user1Id;

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "CHAT_MESSAGE",
        title: "New message",
        message: content.slice(0, 100),
        data: { chatId, senderId },
        link: `/chat/${chatId}`,
      },
    });

    return message;
  }

  async markAsRead(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw ApiError.forbidden("You are not a participant in this chat");
    }

    const result = await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { markedAsRead: result.count };
  }

  async getUnreadCount(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { id: true },
    });

    const chatIds = chats.map((c) => c.id);

    if (chatIds.length === 0) return { total: 0 };

    const count = await prisma.message.count({
      where: {
        chatId: { in: chatIds },
        senderId: { not: userId },
        readAt: null,
      },
    });

    return { total: count };
  }
}

export const chatService = new ChatService();
