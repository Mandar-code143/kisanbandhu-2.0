import twilio from "twilio";
import prisma from "../../config/database";
import config from "../../config";
import { ApiError } from "../../utils/ApiError";
import { CreateIvrRequestInput } from "../../validators/ivr.schema";
import logger from "../../utils/logger";

type UpdateIvrRequestData = {
  status: "APPROVED" | "REJECTED";
  adminNotes?: string;
};

const twilioClient = config.twilio.enabled
  ? twilio(config.twilio.accountSid, config.twilio.authToken)
  : null;

export class IvrService {
  async requestIvrCall(userId: string, input: CreateIvrRequestInput) {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE", endDate: { gt: new Date() } },
      include: { plan: true },
    });

    if (!sub) {
      throw ApiError.badRequest("Active subscription required for IVR calls");
    }

    const ivrCallsThisMonth = await prisma.ivrRequest.count({
      where: {
        userId,
        status: "COMPLETED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    if (ivrCallsThisMonth >= sub.plan.ivrCallsLimit) {
      throw ApiError.badRequest(
        `IVR call limit reached (${sub.plan.ivrCallsLimit}/month). Please upgrade your plan.`
      );
    }

    const ivrRequest = await prisma.ivrRequest.create({
      data: {
        userId,
        jobId: input.jobId || null,
        targetTaluka: input.targetTaluka || null,
        targetNumber: input.targetNumber || null,
        workerType: input.workerType || null,
        message: input.message || null,
        status: "PENDING",
      },
      include: { user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } } },
    });

    logger.info(`IVR request created: ${ivrRequest.id} by user ${userId}`);
    return ivrRequest;
  }

  async getMyRequests(userId: string) {
    const requests = await prisma.ivrRequest.findMany({
      where: { userId },
      include: { job: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async getPendingRequests(params: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      prisma.ivrRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { firstName: true, lastName: true, phone: true, district: true, taluka: true } },
            },
          },
          job: { select: { id: true, title: true, location: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ivrRequest.count({ where }),
    ]);

    return {
      data: requests,
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

  async updateRequestStatus(requestId: string, input: UpdateIvrRequestData, adminId: string) {
    const request = await prisma.ivrRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      throw ApiError.notFound("IVR request not found");
    }

    if (request.status !== "PENDING") {
      throw ApiError.badRequest("IVR request has already been processed");
    }

    const updated = await prisma.ivrRequest.update({
      where: { id: requestId },
      data: {
        status: input.status,
        adminNotes: input.adminNotes || undefined,
        approvedBy: adminId,
        approvedAt: input.status === "APPROVED" ? new Date() : undefined,
      },
    });

    if (input.status === "APPROVED") {
      logger.info(`IVR request approved: ${requestId} by admin ${adminId}`);

      setImmediate(async () => {
        try {
          await this.executeIvrCall(requestId);
        } catch (error) {
          logger.error(`IVR call execution failed: ${requestId}`, error);
        }
      });
    }

    logger.info(`IVR request ${requestId} status updated to ${input.status}`);
    return updated;
  }

  async executeIvrCall(requestId: string) {
    const request = await prisma.ivrRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (!request || request.status !== "APPROVED") {
      throw ApiError.badRequest("IVR request not approved or not found");
    }

    const globalSetting = await prisma.adminSetting.findUnique({
      where: { key: "ivr_global_enabled" },
    });

    const globallyEnabled = globalSetting ? (globalSetting.value as any)?.enabled ?? true : true;

    if (!globallyEnabled) {
      await prisma.ivrRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED", adminNotes: "IVR system is globally disabled" },
      });
      logger.warn(`IVR call rejected (global disable): ${requestId}`);
      return;
    }

    await prisma.ivrRequest.update({
      where: { id: requestId },
      data: { status: "IN_PROGRESS" },
    });

    if (!twilioClient) {
      logger.warn(`Twilio not configured. Simulating IVR call for request ${requestId}`);

      await prisma.ivrRequest.update({
        where: { id: requestId },
        data: {
          status: "COMPLETED",
          callsMade: { increment: 1 },
        },
      });

      logger.info(`IVR call simulated (no Twilio): ${requestId}`);
      return;
    }

    try {
      const targetNumber = request.targetNumber || request.user.profile?.phone;
      if (!targetNumber) {
        throw new Error("No target number available for IVR call");
      }

      const message = request.message || config.ivr.defaultMessage;

      const call = await twilioClient.calls.create({
        twiml: `<Response><Say language="hi-IN">${message}</Say></Response>`,
        to: targetNumber,
        from: config.twilio.phoneNumber,
      });

      await prisma.ivrRequest.update({
        where: { id: requestId },
        data: {
          status: "COMPLETED",
          callsMade: { increment: 1 },
        },
      });

      logger.info(`IVR call completed via Twilio: ${call.sid} for request ${requestId}`);
    } catch (error: any) {
      logger.error(`Twilio call failed for request ${requestId}: ${error.message}`);

      await prisma.ivrRequest.update({
        where: { id: requestId },
        data: {
          status: "COMPLETED",
          callsMade: { increment: 1 },
          adminNotes: `Call failed: ${error.message}`,
        },
      });
    }
  }

  async triggerManualCall(requestId: string, adminId: string) {
    const request = await prisma.ivrRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      throw ApiError.notFound("IVR request not found");
    }

    if (request.status === "PENDING") {
      await this.updateRequestStatus(
        requestId,
        { status: "APPROVED", adminNotes: "Manual trigger by admin" },
        adminId
      );
    } else if (request.status === "APPROVED" || request.status === "COMPLETED") {
      await prisma.ivrRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", approvedBy: adminId, approvedAt: new Date() },
      });

      await this.executeIvrCall(requestId);
    } else {
      throw ApiError.badRequest(`Cannot trigger call for request in status: ${request.status}`);
    }
  }

  async getIvrSettings() {
    const setting = await prisma.adminSetting.findUnique({
      where: { key: "ivr_global_enabled" },
    });

    return {
      ivr_global_enabled: setting
        ? (setting.value as any)?.enabled ?? true
        : true,
      twilio_configured: !!twilioClient,
    };
  }

  async updateIvrSettings(enabled: boolean, adminId: string) {
    const setting = await prisma.adminSetting.upsert({
      where: { key: "ivr_global_enabled" },
      update: { value: { enabled } },
      create: {
        key: "ivr_global_enabled",
        value: { enabled },
        description: "Global toggle for IVR call system",
      },
    });

    logger.info(`IVR settings updated: enabled=${enabled} by admin ${adminId}`);
    return setting;
  }
}

export const ivrService = new IvrService();
