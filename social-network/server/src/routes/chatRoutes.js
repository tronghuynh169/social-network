const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");
const uploadMessageFiles = require("../middlewares/uploadMessageFiles");

router.post(
    "/conversation/:conversationId/members",
    auth,
    chatController.addMembers
);

router.post("/conversation", auth, chatController.createConversation);
router.get(
    "/conversation/id/:conversationId",
    auth,
    chatController.getConversationById
);
router.get("/conversation/:userId", auth, chatController.getUserConversations);
router.post("/message", auth, chatController.sendMessage);
router.get("/message/:conversationId", auth, chatController.getMessages);
router.post("/uploads", uploadMessageFiles, chatController.uploadFiles);

module.exports = router;
