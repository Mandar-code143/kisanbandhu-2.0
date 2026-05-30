import { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";
import { AuthenticatedRequest } from "../../types";

export class UsersController {
  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20", role, search } = req.query;

      const result = await usersService.listUsers({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        role: role as string | undefined,
        search: search as string | undefined,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await usersService.getUser(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await usersService.updateUser(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updated = await usersService.updateRole(id, role, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "User role updated",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await usersService.deleteUser(id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkerProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await usersService.updateWorkerProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Worker profile updated",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFarmerProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await usersService.updateFarmerProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Farmer profile updated",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateContractorProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await usersService.updateContractorProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Contractor profile updated",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
