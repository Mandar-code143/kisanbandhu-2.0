import { Request, Response, NextFunction } from "express";
import { paymentsService } from "./payments.service";
import { AuthenticatedRequest } from "../../types";

export class PaymentsController {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { planId } = req.body;
      const order = await paymentsService.createOrder(req.user!.userId, planId);

      res.status(201).json({
        success: true,
        message: "Order created",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const payment = await paymentsService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      const body = JSON.stringify(req.body);

      await paymentsService.verifyPaymentWebhook(body, signature);

      res.status(200).json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payments = await paymentsService.getPaymentHistory(req.user!.userId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payment = await paymentsService.getPayment(req.params.id);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const transactions = await paymentsService.getTransactionHistory(req.user!.userId);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoices = await paymentsService.getInvoices(req.user!.userId);

      res.status(200).json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  }

  async listAllPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20", status } = req.query;
      const result = await paymentsService.listAllPayments({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as string | undefined,
      });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentsController = new PaymentsController();
