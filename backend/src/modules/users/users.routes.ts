import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth";

const router = Router();

router.get("/", authenticate, requireAdmin, (req, res, next) =>
  usersController.listUsers(req as any, res, next)
);

router.get("/:id", authenticate, (req, res, next) =>
  usersController.getUser(req as any, res, next)
);

router.put("/profile", authenticate, (req, res, next) =>
  usersController.updateUser(req as any, res, next)
);

router.put("/:id/role", authenticate, requireAdmin, (req, res, next) =>
  usersController.updateUserRole(req as any, res, next)
);

router.delete("/:id", authenticate, requireAdmin, (req, res, next) =>
  usersController.deleteUser(req as any, res, next)
);

router.put("/worker/profile", authenticate, (req, res, next) =>
  usersController.updateWorkerProfile(req as any, res, next)
);

router.put("/farmer/profile", authenticate, (req, res, next) =>
  usersController.updateFarmerProfile(req as any, res, next)
);

router.put("/contractor/profile", authenticate, (req, res, next) =>
  usersController.updateContractorProfile(req as any, res, next)
);

export default router;
