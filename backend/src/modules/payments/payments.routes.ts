import express, { Router } from "express";
import { paymentsController } from "./payments.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth";
import { webhookLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post("/create-order", authenticate, (req, res, next) =>
  paymentsController.createOrder(req as any, res, next)
);

router.post("/verify", authenticate, (req, res, next) =>
  paymentsController.verifyPayment(req as any, res, next)
);

router.post("/webhook", webhookLimiter, express.raw({ type: "application/json" }), (req, res, next) =>
  paymentsController.handleWebhook(req, res, next)
);

router.get("/history", authenticate, (req, res, next) =>
  paymentsController.getPaymentHistory(req as any, res, next)
);

router.get("/transactions", authenticate, (req, res, next) =>
  paymentsController.getTransactions(req as any, res, next)
);

router.get("/invoices", authenticate, (req, res, next) =>
  paymentsController.getInvoices(req as any, res, next)
);

router.get("/:id", authenticate, (req, res, next) =>
  paymentsController.getPayment(req as any, res, next)
);

router.get("/", authenticate, requireAdmin, (req, res, next) =>
  paymentsController.listAllPayments(req as any, res, next)
);

export default router;
