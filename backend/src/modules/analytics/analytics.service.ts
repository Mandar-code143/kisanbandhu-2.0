import prisma from "../../config/database";

export class AnalyticsService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalFarmers,
      totalWorkers,
      totalContractors,
      totalJobs,
      openJobs,
      totalApplications,
      totalSubscriptions,
      activeSubscriptions,
      totalRevenue,
      pendingIvrRequests,
      totalProduceListings,
      totalEquipment,
      activeRentals,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: "FARMER", deletedAt: null } }),
      prisma.user.count({ where: { role: "WORKER", deletedAt: null } }),
      prisma.user.count({ where: { role: "CONTRACTOR", deletedAt: null } }),
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.job.count({ where: { status: "OPEN", deletedAt: null } }),
      prisma.application.count(),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.ivrRequest.count({ where: { status: "PENDING" } }),
      prisma.produceListing.count({ where: { status: "ACTIVE" } }),
      prisma.equipment.count(),
      prisma.rental.count({ where: { status: "ACTIVE" } }),
    ]);

    return {
      users: {
        total: totalUsers,
        farmers: totalFarmers,
        workers: totalWorkers,
        contractors: totalContractors,
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        applications: totalApplications,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
      },
      revenue: totalRevenue._sum.amount || 0,
      ivr: {
        pendingRequests: pendingIvrRequests,
      },
      marketplace: {
        activeProduce: totalProduceListings,
        totalEquipment,
        activeRentals,
      },
    };
  }

  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    const payments = await prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        createdAt: { gte: start, lte: end },
      },
      orderBy: { createdAt: "asc" },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const payment of payments) {
      const key = payment.createdAt.toISOString().slice(0, 7);
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + payment.amount;
    }

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const subscriptions = await prisma.subscription.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    return {
      totalRevenue,
      totalTransactions: payments.length,
      newSubscriptions: subscriptions,
      monthlyRevenue,
      period: { start, end },
    };
  }

  async getUserAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, newUsersLast30Days, roleDistribution, languageDistribution] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({
          where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
        }),
        prisma.user.groupBy({
          by: ["role"],
          where: { deletedAt: null },
          _count: true,
        }),
        prisma.profile.groupBy({
          by: ["languagePref"],
          _count: true,
        }),
      ]);

    return {
      totalUsers,
      newUsersLast30Days,
      growthRate: totalUsers > 0 ? ((newUsersLast30Days / totalUsers) * 100).toFixed(2) : "0",
      roleDistribution: roleDistribution.map((r) => ({
        role: r.role,
        count: r._count,
      })),
      languageDistribution: languageDistribution.map((l) => ({
        language: l.languagePref,
        count: l._count,
      })),
    };
  }

  async getJobAnalytics() {
    const [totalJobs, statusDistribution, typeDistribution, topLocations] =
      await Promise.all([
        prisma.job.count({ where: { deletedAt: null } }),
        prisma.job.groupBy({
          by: ["status"],
          where: { deletedAt: null },
          _count: true,
        }),
        prisma.job.groupBy({
          by: ["jobType"],
          where: { deletedAt: null },
          _count: true,
        }),
        prisma.job.groupBy({
          by: ["district"],
          where: { deletedAt: null, district: { not: null } },
          _count: true,
          orderBy: { _count: { district: "desc" } },
          take: 10,
        }),
      ]);

    return {
      totalJobs,
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      typeDistribution: typeDistribution.map((t) => ({
        type: t.jobType,
        count: t._count,
      })),
      topLocations: topLocations.map((l) => ({
        district: l.district,
        count: l._count,
      })),
    };
  }

  async getSubscriptionAnalytics() {
    const [totalPlans, planDistribution, revenueByPlan] = await Promise.all([
      prisma.plan.count(),
      prisma.subscription.groupBy({
        by: ["planId"],
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
    ]);

    const plans = await prisma.plan.findMany();

    const planStats = await Promise.all(
      plans.map(async (plan) => {
        const count = await prisma.subscription.count({
          where: { planId: plan.id },
        });
        return {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          subscriberCount: count,
        };
      })
    );

    return {
      totalPlans,
      totalRevenue: revenueByPlan._sum.amount || 0,
      planStats,
    };
  }

  async getIvrAnalytics() {
    const [totalRequests, statusDistribution, approvedCalls, pendingCalls] =
      await Promise.all([
        prisma.ivrRequest.count(),
        prisma.ivrRequest.groupBy({
          by: ["status"],
          _count: true,
        }),
        prisma.ivrRequest.aggregate({
          where: { status: "COMPLETED" },
          _sum: { callsMade: true },
        }),
        prisma.ivrRequest.count({ where: { status: "PENDING" } }),
      ]);

    return {
      totalRequests,
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      totalCallsMade: approvedCalls._sum.callsMade || 0,
      pendingRequests: pendingCalls,
    };
  }
}

export const analyticsService = new AnalyticsService();
