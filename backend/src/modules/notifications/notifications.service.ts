import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";

export class NotificationsService {
  async getUserNotifications(userId: string, params: { page: number; limit: number; unreadOnly?: boolean }) {
    const { page, limit, unreadOnly } = params;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) where.readAt = null;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = unreadOnly
      ? total
      : await prisma.notification.count({
          where: { userId, readAt: null },
        });

    return {
      data: notifications,
      unreadCount,
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

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw ApiError.notFound("Notification not found");
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden("Not your notification");
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { markedAsRead: result.count };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw ApiError.notFound("Notification not found");
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden("Not your notification");
    }

    await prisma.notification.delete({ where: { id: notificationId } });
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    link?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        data: data.data || undefined,
        link: data.link || undefined,
      },
    });

    return notification;
  }

  async broadcastNotification(data: {
    type: string;
    title: string;
    message: string;
    link?: string;
    roleFilter?: string;
  }) {
    const where: any = {};
    if (data.roleFilter) where.role = data.roleFilter;

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            type: data.type as any,
            title: data.title,
            message: data.message,
            link: data.link || undefined,
          },
        })
      )
    );

    return { broadcasted: notifications.length };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { unreadCount: count };
  }
}

export const notificationsService = new NotificationsService();
