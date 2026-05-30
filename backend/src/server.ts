import app from "./app";
import config from "./config";
import logger from "./utils/logger";
import prisma from "./config/database";

process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

const server = app.listen(config.port, "0.0.0.0", () => {
  logger.info(`Krushi Rojgar Sandhi API running in ${config.env} mode on port ${config.port}`);
  logger.info(`Health check: http://localhost:${config.port}/api/v1/health`);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", {
    message: err.message,
    stack: err.stack,
  });
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Process terminated");
    process.exit(0);
  });
});

export default server;
