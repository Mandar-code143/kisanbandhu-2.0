import { Router } from "express";
import { marketplaceController } from "./marketplace.controller";
import { authenticate, requireFarmer } from "../../middlewares/auth";

const router = Router();

// Produce listings
router.get("/produce", (req, res, next) =>
  marketplaceController.listProduce(req as any, res, next)
);

router.get("/produce/:id", (req, res, next) =>
  marketplaceController.getProduceListing(req as any, res, next)
);

router.post("/produce", authenticate, requireFarmer, (req, res, next) =>
  marketplaceController.createProduceListing(req as any, res, next)
);

router.put("/produce/:id", authenticate, requireFarmer, (req, res, next) =>
  marketplaceController.updateProduceListing(req as any, res, next)
);

router.delete("/produce/:id", authenticate, requireFarmer, (req, res, next) =>
  marketplaceController.deleteProduceListing(req as any, res, next)
);

router.get("/my/produce", authenticate, requireFarmer, (req, res, next) =>
  marketplaceController.getMyProduce(req as any, res, next)
);

// Equipment
router.get("/equipment", (req, res, next) =>
  marketplaceController.listEquipment(req as any, res, next)
);

router.get("/equipment/:id", (req, res, next) =>
  marketplaceController.getEquipment(req as any, res, next)
);

router.post("/equipment", authenticate, (req, res, next) =>
  marketplaceController.createEquipment(req as any, res, next)
);

router.put("/equipment/:id", authenticate, (req, res, next) =>
  marketplaceController.updateEquipment(req as any, res, next)
);

router.delete("/equipment/:id", authenticate, (req, res, next) =>
  marketplaceController.deleteEquipment(req as any, res, next)
);

router.get("/my/equipment", authenticate, (req, res, next) =>
  marketplaceController.getMyEquipment(req as any, res, next)
);

// Rentals
router.post("/equipment/:equipmentId/rent", authenticate, (req, res, next) =>
  marketplaceController.rentEquipment(req as any, res, next)
);

router.put("/rentals/:id/status", authenticate, (req, res, next) =>
  marketplaceController.updateRentalStatus(req as any, res, next)
);

router.get("/my/rentals", authenticate, (req, res, next) =>
  marketplaceController.getMyRentals(req as any, res, next)
);

export default router;
