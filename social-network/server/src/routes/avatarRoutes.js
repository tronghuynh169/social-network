const express = require("express");
const avatarController = require("../controllers/avatarController");
const router = express.Router();

router.post("/update", avatarController.updateAvatar);
router.delete("/:slug", avatarController.deleteAvatar);

module.exports = router;
