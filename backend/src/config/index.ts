import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-dev",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-dev",
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  },

  database: {
    url: process.env.DATABASE_URL || "",
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "mock_key_id",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret",
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
    enabled: process.env.TWILIO_ENABLED === "true",
  },

  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "noreply@krushirojgar.in",
  },

  redis: {
    url: process.env.REDIS_URL || "",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },

  logLevel: process.env.LOG_LEVEL || "info",

  ivr: {
    globalEnabled: process.env.IVR_GLOBAL_ENABLED === "true",
    defaultMessage:
      process.env.IVR_DEFAULT_MESSAGE ||
      "नमस्कार, कृषी रोजगार संधी प्लॅटफॉर्मवर आपले स्वागत आहे.",
  },
};

export default config;
