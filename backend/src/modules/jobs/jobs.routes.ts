import { Router } from "express";
import { jobsController } from "./jobs.controller";
import { authenticate, requireFarmer, requireWorker } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createJobSchema, updateJobSchema, jobQuerySchema, applyJobSchema, updateApplicationSchema } from "../../validators/jobs.schema";

const router = Router();

router.get("/", validate(jobQuerySchema), (req, res, next) =>
  jobsController.listJobs(req, res, next)
);

router.get("/my-applications", authenticate, requireWorker, (req, res, next) =>
  jobsController.getMyApplications(req as any, res, next)
);

router.get("/:id", (req, res, next) =>
  jobsController.getJob(req, res, next)
);

router.post("/", authenticate, requireFarmer, validate(createJobSchema), (req, res, next) =>
  jobsController.createJob(req as any, res, next)
);

router.put("/:id", authenticate, requireFarmer, validate(updateJobSchema), (req, res, next) =>
  jobsController.updateJob(req as any, res, next)
);

router.delete("/:id", authenticate, requireFarmer, (req, res, next) =>
  jobsController.deleteJob(req as any, res, next)
);

router.post("/:jobId/apply", authenticate, requireWorker, validate(applyJobSchema), (req, res, next) =>
  jobsController.applyForJob(req as any, res, next)
);

router.get("/:jobId/applications", authenticate, requireFarmer, (req, res, next) =>
  jobsController.getJobApplications(req as any, res, next)
);

router.put("/:jobId/applications/:applicationId", authenticate, requireFarmer, validate(updateApplicationSchema), (req, res, next) =>
  jobsController.updateApplicationStatus(req as any, res, next)
);

export default router;
