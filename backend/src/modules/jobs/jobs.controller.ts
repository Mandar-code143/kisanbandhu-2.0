import { Request, Response, NextFunction } from "express";
import { jobsService } from "./jobs.service";
import { AuthenticatedRequest } from "../../types";

export class JobsController {
  async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await jobsService.createJob(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobsService.listJobs(req.query as any);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobsService.getJob(req.params.id);

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await jobsService.updateJob(req.params.id, req.user!.userId, req.body);

      res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await jobsService.deleteJob(req.params.id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "Job deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async applyForJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await jobsService.applyForJob(
        req.params.jobId,
        req.user!.userId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applications = await jobsService.getApplicationsForJob(
        req.params.jobId,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applications = await jobsService.getUserApplications(req.user!.userId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await jobsService.updateApplicationStatus(
        req.params.jobId,
        req.params.applicationId,
        req.user!.userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Application status updated",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobsController = new JobsController();
