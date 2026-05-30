import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../../config/database";
import config from "../../config";
import { ApiError } from "../../utils/ApiError";
import logger from "../../utils/logger";

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class PaymentsService {
  async createOrder(userId: string, planId: string) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw ApiError.notFound("Plan not found or inactive");
    }

    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (activeSub) {
      throw ApiError.conflict("You already have an active subscription");
    }

    const receipt = `rcpt_${userId.slice(0, 8)}_${Date.now()}`;

    const options = {
      amount: Math.round(plan.price * 100),
      currency: "INR",
      receipt,
      notes: {
        userId,
        planId,
        planName: plan.name,
      },
    };

    const order = await razorpay.orders.create(options);

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: "INR",
        status: "PENDING",
        description: `Subscription: ${plan.name}`,
        razorpayOrderId: order.id,
      },
    });

    logger.info(`Razorpay order created: ${order.id} for user ${userId}`);

    return {
      orderId: order.id.toString(),
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpay.keyId,
      planName: plan.name,
      planId: plan.id,
      paymentId: payment.id,
    };
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: "FAILED" },
      });
      throw ApiError.badRequest("Invalid payment signature");
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      throw ApiError.notFound("Payment record not found");
    }

    const updatedPayment = await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        status: "SUCCESS",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    await prisma.transaction.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT",
        amount: payment.amount,
        currency: payment.currency,
        status: "SUCCESS",
        description: payment.description || "Payment completed",
        referenceId: razorpayPaymentId,
        referenceType: "razorpay_payment",
        paymentId: payment.id,
      },
    });

    if (payment.description?.includes("Subscription")) {
      let planId: string | null = null;

      try {
        const order = await razorpay.orders.fetch(razorpayOrderId);
        planId = order.notes?.planId ? String(order.notes.planId) : null;
      } catch (err) {
        logger.warn(`Could not fetch Razorpay order notes for ${razorpayOrderId}`);
      }

      if (planId) {
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (plan) {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + plan.durationDays);

          await prisma.subscription.create({
            data: {
              userId: payment.userId,
              planId: plan.id,
              startDate,
              endDate,
              status: "ACTIVE",
            },
          });

          await this.generateInvoice(payment.id);
          logger.info(`Subscription created for user ${payment.userId} with plan ${plan.name}`);
        }
      }
    }

    logger.info(`Payment verified: ${razorpayPaymentId}`);
    return updatedPayment;
  }

  async verifyPaymentWebhook(webhookBody: string, signature: string) {
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.webhookSecret)
      .update(webhookBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw ApiError.badRequest("Invalid webhook signature");
    }

    const payload = JSON.parse(webhookBody);

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    logger.info(`Razorpay webhook received: ${event}`);

    if (event === "payment.captured" && paymentEntity) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: paymentEntity.order_id },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: paymentEntity.id,
        },
      });
    }

    if (event === "payment.failed" && paymentEntity) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: paymentEntity.order_id },
        data: { status: "FAILED" },
      });
    }
  }

  async generateInvoice(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.status !== "SUCCESS") {
      return null;
    }

    const sub = await prisma.subscription.findFirst({
      where: { userId: payment.userId, status: "ACTIVE" },
    });

    if (!sub) return null;

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: sub.id,
        amount: payment.amount,
        status: "PAID",
        invoiceNumber,
        paidAt: new Date(),
      },
    });

    logger.info(`Invoice generated: ${invoiceNumber} for payment ${paymentId}`);
    return invoice;
  }

  async getPaymentHistory(userId: string) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        transactions: true,
      },
    });

    return payments;
  }

  async getPayment(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: { select: { id: true, email: true } }, transactions: true },
    });

    if (!payment) {
      throw ApiError.notFound("Payment not found");
    }

    return payment;
  }

  async getTransactionHistory(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return transactions;
  }

  async getInvoices(userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        subscription: { userId },
      },
      include: {
        subscription: {
          select: { plan: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return invoices;
  }

  async listAllPayments(params: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
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
}

export const paymentsService = new PaymentsService();
