import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { CreateJobInput, UpdateJobInput, JobQueryInput, ApplyJobInput, UpdateApplicationInput } from "../../validators/jobs.schema";
import logger from "../../utils/logger";

export class JobsService {
  async createJob(userId: string, input: CreateJobInput) {
    const job = await prisma.job.create({
      data: {
        ...input,
        postedById: userId,
      },
      include: {
        postedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    logger.info(`Job created: ${job.id} by user ${userId}`);
    return job;
  }

  async listJobs(params: JobQueryInput) {
    const { page, limit, status, jobType, district, taluka, search, postedById, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (jobType) where.jobType = jobType;
    if (district) where.district = district;
    if (taluka) where.taluka = taluka;
    if (postedById) where.postedById = postedById;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy && ["createdAt", "updatedAt", "title", "salary"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          postedBy: {
            select: {
              id: true,
              profile: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
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

  async getJob(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: { firstName: true, lastName: true, phone: true, district: true, taluka: true },
            },
          },
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                profile: { select: { firstName: true, lastName: true } },
                worker: { select: { skills: true, experience: true, dailyRate: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      throw ApiError.notFound("Job not found");
    }

    return job;
  }

  async updateJob(jobId: string, userId: string, input: UpdateJobInput) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw ApiError.notFound("Job not found");
    }

    if (job.postedById !== userId) {
      throw ApiError.forbidden("You can only update your own jobs");
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: input,
      include: {
        postedBy: {
          select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    logger.info(`Job updated: ${jobId}`);
    return updated;
  }

  async deleteJob(jobId: string, userId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw ApiError.notFound("Job not found");
    }

    if (job.postedById !== userId) {
      throw ApiError.forbidden("You can only delete your own jobs");
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
    });

    logger.info(`Job soft-deleted: ${jobId}`);
  }

  async applyForJob(jobId: string, userId: string, input: ApplyJobInput) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw ApiError.notFound("Job not found");
    }

    if (job.status !== "OPEN") {
      throw ApiError.badRequest("This job is no longer accepting applications");
    }

    if (job.postedById === userId) {
      throw ApiError.badRequest("You cannot apply to your own job");
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_applicantId: { jobId, applicantId: userId } },
    });

    if (existing) {
      throw ApiError.conflict("You have already applied for this job");
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: userId,
        coverLetter: input.coverLetter || null,
        notes: input.notes || null,
      },
      include: {
        job: { select: { title: true } },
        applicant: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
            worker: { select: { skills: true, experience: true, dailyRate: true } },
          },
        },
      },
    });

    logger.info(`Application created: ${application.id} for job ${jobId}`);

    return application;
  }

  async getApplicationsForJob(jobId: string, userId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw ApiError.notFound("Job not found");
    }

    if (job.postedById !== userId) {
      throw ApiError.forbidden("You can only view applications for your own jobs");
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, phone: true, district: true, taluka: true } },
            worker: { select: { skills: true, experience: true, dailyRate: true, availability: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
  }

  async getUserApplications(userId: string) {
    const applications = await prisma.application.findMany({
      where: { applicantId: userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
            salary: true,
            salaryType: true,
            status: true,
            postedBy: {
              select: {
                profile: { select: { firstName: true, lastName: true, phone: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications;
  }

  async updateApplicationStatus(jobId: string, applicationId: string, userId: string, input: UpdateApplicationInput) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw ApiError.notFound("Job not found");
    }

    if (job.postedById !== userId) {
      throw ApiError.forbidden("You can only update applications for your own jobs");
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.jobId !== jobId) {
      throw ApiError.notFound("Application not found");
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: input.status, notes: input.notes ?? undefined },
      include: {
        applicant: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    logger.info(`Application ${applicationId} status updated to ${input.status}`);
    return updated;
  }
}

export const jobsService = new JobsService();
