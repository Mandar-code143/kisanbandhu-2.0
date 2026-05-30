import { Response, NextFunction } from "express";
import { marketplaceService } from "./marketplace.service";
import { AuthenticatedRequest } from "../../types";

export class MarketplaceController {
  // Produce Listings
  async createProduceListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listing = await marketplaceService.createProduceListing(req.body.farmerId || req.user!.userId, req.user!.userId, req.body);
      res.status(201).json({ success: true, message: "Produce listing created", data: listing });
    } catch (error) {
      next(error);
    }
  }

  async listProduce(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await marketplaceService.listProduce(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getProduceListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listing = await marketplaceService.getProduceListing(req.params.id);
      res.status(200).json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }

  async updateProduceListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listing = await marketplaceService.updateProduceListing(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: "Listing updated", data: listing });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduceListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await marketplaceService.deleteProduceListing(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: "Listing removed" });
    } catch (error) {
      next(error);
    }
  }

  // Equipment
  async createEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const equipment = await marketplaceService.createEquipment(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: "Equipment listed", data: equipment });
    } catch (error) {
      next(error);
    }
  }

  async listEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await marketplaceService.listEquipment(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const equipment = await marketplaceService.getEquipment(req.params.id);
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  }

  async updateEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const equipment = await marketplaceService.updateEquipment(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: "Equipment updated", data: equipment });
    } catch (error) {
      next(error);
    }
  }

  async deleteEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await marketplaceService.deleteEquipment(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: "Equipment deleted" });
    } catch (error) {
      next(error);
    }
  }

  // Rentals
  async rentEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rental = await marketplaceService.rentEquipment(req.params.equipmentId, req.user!.userId, req.body);
      res.status(201).json({ success: true, message: "Rental request submitted", data: rental });
    } catch (error) {
      next(error);
    }
  }

  async updateRentalStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rental = await marketplaceService.updateRentalStatus(req.params.id, req.user!.userId, req.body.status);
      res.status(200).json({ success: true, message: "Rental status updated", data: rental });
    } catch (error) {
      next(error);
    }
  }

  async getMyRentals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rentals = await marketplaceService.getMyRentals(req.user!.userId);
      res.status(200).json({ success: true, data: rentals });
    } catch (error) {
      next(error);
    }
  }

  async getMyEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const equipment = await marketplaceService.getMyEquipmentListings(req.user!.userId);
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  }

  async getMyProduce(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listings = await marketplaceService.getMyProduceListings(req.user!.userId);
      res.status(200).json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  }
}

export const marketplaceController = new MarketplaceController();
