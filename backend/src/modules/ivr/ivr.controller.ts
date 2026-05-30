import { Request, Response, NextFunction } from "express";
import { ivrService } from "./ivr.service";
import { AuthenticatedRequest } from "../../types";

export class IvrController {
  async requestCall(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ivrRequest = await ivrService.requestIvrCall(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        message: "IVR call request submitted for admin approval",
        data: ivrRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requests = await ivrService.getMyRequests(req.user!.userId);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20", status } = req.query;
      const result = await ivrService.getPendingRequests({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as string | undefined,
      });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateRequestStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ivrService.updateRequestStatus(id, req.body, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "IVR request status updated",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async triggerManualCall(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ivrService.triggerManualCall(id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "IVR call triggered",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await ivrService.getIvrSettings();

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { enabled } = req.body.value;
      const setting = await ivrService.updateIvrSettings(enabled, req.user!.userId);

      res.status(200).json({
        success: true,
        message: `IVR system ${enabled ? "enabled" : "disabled"}`,
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ivrController = new IvrController();
