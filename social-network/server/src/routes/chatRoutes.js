const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");

router.post("/conversation", auth, chatController.createConversation);
router.get(
    "/conversation/id/:conversationId",
    auth,
    chatController.getConversationById
);
router.get("/conversation/:userId", auth, chatController.getUserConversations);
router.post("/message", auth, chatController.sendMessage);
router.get("/message/:conversationId", auth, chatController.getMessages);

module.exports = router;
