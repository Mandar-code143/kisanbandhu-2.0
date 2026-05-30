import { Request, Response, NextFunction } from "express";
import { analyticsService } from "./analytics.service";
import { AuthenticatedRequest } from "../../types";

export class AnalyticsController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const result = await analyticsService.getRevenueAnalytics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getUserAnalytics();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getJobAnalytics();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getSubscriptionAnalytics();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getIvrAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getIvrAnalytics();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
