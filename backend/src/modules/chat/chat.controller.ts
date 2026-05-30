import { Response, NextFunction } from "express";
import { chatService } from "./chat.service";
import { AuthenticatedRequest } from "../../types";

export class ChatController {
  async createChat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { user2Id, jobId } = req.body;
      const chat = await chatService.createChat(req.user!.userId, user2Id, jobId);

      res.status(201).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.getUserChats(req.user!.userId);

      res.status(200).json({
        success: true,
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const { page = "1", limit = "50" } = req.query;

      const result = await chatService.getChatMessages(chatId, req.user!.userId, {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const { content } = req.body;

      const message = await chatService.sendMessage(chatId, req.user!.userId, content);

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const result = await chatService.markAsRead(chatId, req.user!.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await chatService.getUnreadCount(req.user!.userId);

      res.status(200).json({
        success: true,
        data: count,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
