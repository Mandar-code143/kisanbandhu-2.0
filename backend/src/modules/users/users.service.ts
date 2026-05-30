import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

export class UsersService {
  async listUsers(params: {
    page: number;
    limit: number;
    role?: string;
    search?: string;
  }) {
    const { page, limit, role, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { firstName: { contains: search, mode: "insensitive" } } },
        { profile: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              district: true,
              taluka: true,
              village: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
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

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        farmer: true,
        worker: true,
        contractor: true,
        _count: {
          select: {
            jobsPosted: true,
            applications: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Safely parse JSON strings back into arrays for frontend usage
    if (user.farmer && typeof user.farmer.cropTypes === "string") {
      try {
        user.farmer.cropTypes = JSON.parse(user.farmer.cropTypes);
      } catch {
        (user.farmer as any).cropTypes = [];
      }
    }
    if (user.worker && typeof user.worker.skills === "string") {
      try {
        user.worker.skills = JSON.parse(user.worker.skills);
      } catch {
        (user.worker as any).skills = [];
      }
    }
    if (user.contractor && typeof user.contractor.specialization === "string") {
      try {
        user.contractor.specialization = JSON.parse(user.contractor.specialization);
      } catch {
        (user.contractor as any).specialization = [];
      }
    }

    return user as any;
  }

  async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      bio?: string;
      languagePref?: string;
      district?: string;
      taluka?: string;
      village?: string;
      pincode?: string;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const profileUpdate: any = {};
    if (data.firstName !== undefined) profileUpdate.firstName = data.firstName;
    if (data.lastName !== undefined) profileUpdate.lastName = data.lastName;
    if (data.phone !== undefined) profileUpdate.phone = data.phone;
    if (data.avatar !== undefined) profileUpdate.avatar = data.avatar;
    if (data.bio !== undefined) profileUpdate.bio = data.bio;
    if (data.languagePref !== undefined) profileUpdate.languagePref = data.languagePref;
    if (data.district !== undefined) profileUpdate.district = data.district;
    if (data.taluka !== undefined) profileUpdate.taluka = data.taluka;
    if (data.village !== undefined) profileUpdate.village = data.village;
    if (data.pincode !== undefined) profileUpdate.pincode = data.pincode;

    if (Object.keys(profileUpdate).length > 0) {
      await prisma.profile.update({
        where: { userId },
        data: profileUpdate,
      });
    }

    if (data.phone !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: data.phone },
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        profile: true,
      },
    });

    logger.info(`User profile updated: ${userId}`);
    return updated;
  }

  async updateRole(userId: string, role: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const validRoles = ["FARMER", "WORKER", "CONTRACTOR", "ADMIN"];
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest("Invalid role");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, email: true, role: true },
    });

    logger.info(`User role updated: ${userId} -> ${role} by admin ${adminId}`);
    return updated;
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), refreshToken: null },
    });

    logger.info(`User soft-deleted: ${userId} by admin ${adminId}`);
  }

  async updateWorkerProfile(
    userId: string,
    data: {
      skills?: string[];
      experience?: number;
      availability?: boolean;
      dailyRate?: number;
      preferredTaluka?: string;
    }
  ) {
    const worker = await prisma.worker.findUnique({ where: { userId } });
    if (!worker) {
      throw ApiError.notFound("Worker profile not found");
    }

    const updateData: any = {};
    if (data.skills !== undefined) {
      updateData.skills = JSON.stringify(data.skills);
    }
    if (data.experience !== undefined) updateData.experience = data.experience;
    if (data.availability !== undefined) updateData.availability = data.availability;
    if (data.dailyRate !== undefined) updateData.dailyRate = data.dailyRate;
    if (data.preferredTaluka !== undefined) updateData.preferredTaluka = data.preferredTaluka;

    const updated = await prisma.worker.update({
      where: { userId },
      data: updateData,
    });

    if (updated && typeof updated.skills === "string") {
      try {
        (updated as any).skills = JSON.parse(updated.skills);
      } catch {
        (updated as any).skills = [];
      }
    }

    return updated as any;
  }

  async updateFarmerProfile(
    userId: string,
    data: {
      landSize?: number;
      cropTypes?: string[];
    }
  ) {
    const farmer = await prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) {
      throw ApiError.notFound("Farmer profile not found");
    }

    const updated = await prisma.farmer.update({
      where: { userId },
      data: {
        ...(data.landSize !== undefined && { landSize: data.landSize }),
        ...(data.cropTypes !== undefined && { cropTypes: JSON.stringify(data.cropTypes) }),
      },
    });

    if (updated && typeof updated.cropTypes === "string") {
      try {
        (updated as any).cropTypes = JSON.parse(updated.cropTypes);
      } catch {
        (updated as any).cropTypes = [];
      }
    }

    return updated as any;
  }

  async updateContractorProfile(
    userId: string,
    data: {
      companyName?: string;
      licenseNumber?: string;
      specialization?: string[];
    }
  ) {
    const contractor = await prisma.contractor.findUnique({ where: { userId } });
    if (!contractor) {
      throw ApiError.notFound("Contractor profile not found");
    }

    const updated = await prisma.contractor.update({
      where: { userId },
      data: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber }),
        ...(data.specialization !== undefined && { specialization: JSON.stringify(data.specialization) }),
      },
    });

    if (updated && typeof updated.specialization === "string") {
      try {
        (updated as any).specialization = JSON.parse(updated.specialization);
      } catch {
        (updated as any).specialization = [];
      }
    }

    return updated as any;
  }
}

export const usersService = new UsersService();
