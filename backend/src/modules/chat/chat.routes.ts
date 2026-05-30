import { Router } from "express";
import { chatController } from "./chat.controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.post("/", authenticate, (req, res, next) =>
  chatController.createChat(req as any, res, next)
);

router.get("/", authenticate, (req, res, next) =>
  chatController.getChats(req as any, res, next)
);

router.get("/unread", authenticate, (req, res, next) =>
  chatController.getUnreadCount(req as any, res, next)
);

router.get("/:chatId/messages", authenticate, (req, res, next) =>
  chatController.getMessages(req as any, res, next)
);

router.post("/:chatId/messages", authenticate, (req, res, next) =>
  chatController.sendMessage(req as any, res, next)
);

router.put("/:chatId/read", authenticate, (req, res, next) =>
  chatController.markAsRead(req as any, res, next)
);

export default router;
