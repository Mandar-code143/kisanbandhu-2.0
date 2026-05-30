import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

export class MarketplaceService {
  async createProduceListing(farmerId: string, userId: string, data: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    description?: string;
    imageUrl?: string;
    district?: string;
    taluka?: string;
  }) {
    const farmer = await prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) {
      throw ApiError.badRequest("Only farmers can create produce listings");
    }

    const listing = await prisma.produceListing.create({
      data: {
        farmerId: farmer.id,
        ...data,
      },
    });

    logger.info(`Produce listing created: ${listing.id}`);
    return listing;
  }

  async listProduce(params: {
    page: number;
    limit: number;
    category?: string;
    status?: string;
    district?: string;
    taluka?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { page, limit, category, status, district, taluka, search, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (district) where.district = district;
    if (taluka) where.taluka = taluka;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy && ["price", "quantity", "createdAt", "name"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [listings, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          farmer: {
            select: {
              user: {
                select: {
                  profile: { select: { firstName: true, lastName: true, phone: true, district: true, village: true } },
                },
              },
            },
          },
        },
      }),
      prisma.produceListing.count({ where }),
    ]);

    return {
      data: listings,
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

  async getProduceListing(id: string) {
    const listing = await prisma.produceListing.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            landSize: true,
            cropTypes: true,
            user: {
              select: {
                profile: { select: { firstName: true, lastName: true, phone: true, district: true, taluka: true, village: true } },
              },
            },
          },
        },
      },
    });

    if (!listing) {
      throw ApiError.notFound("Produce listing not found");
    }

    return listing;
  }

  async updateProduceListing(id: string, userId: string, data: any) {
    const listing = await prisma.produceListing.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!listing) {
      throw ApiError.notFound("Produce listing not found");
    }

    if (listing.farmer.userId !== userId) {
      throw ApiError.forbidden("You can only update your own listings");
    }

    const updated = await prisma.produceListing.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteProduceListing(id: string, userId: string) {
    const listing = await prisma.produceListing.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!listing) {
      throw ApiError.notFound("Produce listing not found");
    }

    if (listing.farmer.userId !== userId) {
      throw ApiError.forbidden("You can only delete your own listings");
    }

    await prisma.produceListing.update({
      where: { id },
      data: { status: "HIDDEN" },
    });

    logger.info(`Produce listing hidden: ${id}`);
  }

  async createEquipment(userId: string, data: {
    name: string;
    type: string;
    description?: string;
    hourlyRate?: number;
    dailyRate?: number;
    imageUrl?: string;
    location: string;
    district?: string;
    taluka?: string;
  }) {
    const equipment = await prisma.equipment.create({
      data: {
        ...data,
        ownerId: userId,
      },
    });

    logger.info(`Equipment listed: ${equipment.id} by user ${userId}`);
    return equipment;
  }

  async listEquipment(params: {
    page: number;
    limit: number;
    type?: string;
    isAvailable?: boolean;
    district?: string;
    taluka?: string;
    search?: string;
  }) {
    const { page, limit, type, isAvailable, district, taluka, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (district) where.district = district;
    if (taluka) where.taluka = taluka;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              profile: { select: { firstName: true, lastName: true, phone: true, district: true, taluka: true } },
            },
          },
          _count: { select: { rentals: true } },
        },
      }),
      prisma.equipment.count({ where }),
    ]);

    return {
      data: equipment,
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

  async getEquipment(id: string) {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            profile: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        rentals: {
          include: {
            renter: {
              select: {
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!equipment) {
      throw ApiError.notFound("Equipment not found");
    }

    return equipment;
  }

  async updateEquipment(id: string, userId: string, data: any) {
    const equipment = await prisma.equipment.findUnique({ where: { id } });

    if (!equipment) {
      throw ApiError.notFound("Equipment not found");
    }

    if (equipment.ownerId !== userId) {
      throw ApiError.forbidden("You can only update your own equipment");
    }

    const updated = await prisma.equipment.update({ where: { id }, data });
    return updated;
  }

  async deleteEquipment(id: string, userId: string) {
    const equipment = await prisma.equipment.findUnique({ where: { id } });

    if (!equipment) {
      throw ApiError.notFound("Equipment not found");
    }

    if (equipment.ownerId !== userId) {
      throw ApiError.forbidden("You can only delete your own equipment");
    }

    await prisma.equipment.delete({ where: { id } });
    logger.info(`Equipment deleted: ${id}`);
  }

  async rentEquipment(equipmentId: string, renterId: string, data: {
    startDate: string;
    endDate: string;
    totalAmount: number;
  }) {
    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });

    if (!equipment) {
      throw ApiError.notFound("Equipment not found");
    }

    if (!equipment.isAvailable) {
      throw ApiError.badRequest("Equipment is not available for rent");
    }

    if (equipment.ownerId === renterId) {
      throw ApiError.badRequest("You cannot rent your own equipment");
    }

    const rental = await prisma.rental.create({
      data: {
        equipmentId,
        renterId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalAmount: data.totalAmount,
        status: "PENDING",
      },
      include: {
        equipment: { select: { name: true, ownerId: true } },
      },
    });

    logger.info(`Rental created: ${rental.id} for equipment ${equipmentId}`);
    return rental;
  }

  async updateRentalStatus(rentalId: string, userId: string, status: string) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { equipment: true },
    });

    if (!rental) {
      throw ApiError.notFound("Rental not found");
    }

    if (rental.equipment.ownerId !== userId) {
      throw ApiError.forbidden("Only the equipment owner can update rental status");
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ["ACTIVE", "CANCELLED"],
      ACTIVE: ["COMPLETED", "CANCELLED"],
    };

    if (!validTransitions[rental.status]?.includes(status)) {
      throw ApiError.badRequest(`Cannot transition from ${rental.status} to ${status}`);
    }

    const updated = await prisma.rental.update({
      where: { id: rentalId },
      data: { status: status as any },
      include: { equipment: { select: { name: true } } },
    });

    if (status === "ACTIVE") {
      await prisma.equipment.update({
        where: { id: rental.equipmentId },
        data: { isAvailable: false },
      });
    }

    if (status === "COMPLETED" || status === "CANCELLED") {
      await prisma.equipment.update({
        where: { id: rental.equipmentId },
        data: { isAvailable: true },
      });
    }

    logger.info(`Rental ${rentalId} status updated to ${status}`);
    return updated;
  }

  async getMyRentals(userId: string) {
    const rentals = await prisma.rental.findMany({
      where: { renterId: userId },
      include: {
        equipment: {
          select: { id: true, name: true, type: true, dailyRate: true, hourlyRate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return rentals;
  }

  async getMyEquipmentListings(userId: string) {
    const equipment = await prisma.equipment.findMany({
      where: { ownerId: userId },
      include: {
        _count: { select: { rentals: true } },
        rentals: {
          where: { status: "ACTIVE" },
          select: { id: true, startDate: true, endDate: true, renterId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return equipment;
  }

  async getMyProduceListings(userId: string) {
    const farmer = await prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) return [];

    const listings = await prisma.produceListing.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: "desc" },
    });

    return listings;
  }
}

export const marketplaceService = new MarketplaceService();
