import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./config";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { generalLimiter, apiLimiter } from "./middlewares/rateLimiter";
import logger from "./utils/logger";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import jobRoutes from "./modules/jobs/jobs.routes";
import subscriptionRoutes from "./modules/subscriptions/subscriptions.routes";
import paymentRoutes from "./modules/payments/payments.routes";
import ivrRoutes from "./modules/ivr/ivr.routes";
import marketplaceRoutes from "./modules/marketplace/marketplace.routes";
import chatRoutes from "./modules/chat/chat.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";

const app = express();

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    return callback(null, true);
  },
  credentials: true,
}));

app.use(generalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.env !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Krushi Rojgar Sandhi API is running",
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", apiLimiter, authRoutes);
app.use("/api/v1/users", apiLimiter, userRoutes);
app.use("/api/v1/jobs", apiLimiter, jobRoutes);
app.use("/api/v1/subscriptions", apiLimiter, subscriptionRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/ivr", apiLimiter, ivrRoutes);
app.use("/api/v1/marketplace", apiLimiter, marketplaceRoutes);
app.use("/api/v1/chat", apiLimiter, chatRoutes);
app.use("/api/v1/notifications", apiLimiter, notificationRoutes);
app.use("/api/v1/analytics", apiLimiter, analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
