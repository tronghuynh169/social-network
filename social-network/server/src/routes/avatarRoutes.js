const express = require("express");
const avatarController = require("../controllers/avatarController");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

router.post("/update", auth, avatarController.updateAvatar);
router.delete("/:slug", auth, avatarController.deleteAvatar);

module.exports = router;
