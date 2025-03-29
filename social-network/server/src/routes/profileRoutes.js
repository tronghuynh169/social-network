const express = require("express");
const router = express.Router();
const {
    getProfileByUsername,
    updateProfileByUsername,
} = require("../controllers/profileController");
const auth = require("../middlewares/authMiddleware");
const { getProfileBySlug } = require("../controllers/profileController");

// 📌 Lấy profile đầy đủ theo username
router.get("/:slug", getProfileBySlug);

// 📌 Cập nhật profile theo username (chỉ chủ tài khoản)
router.put("/:username", auth, updateProfileByUsername);

module.exports = router;
