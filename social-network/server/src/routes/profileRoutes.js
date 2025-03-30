const express = require("express");
const router = express.Router();
const {
    getProfileByUsername,
    updateProfileByUsername,
} = require("../controllers/profileController");
const auth = require("../middlewares/authMiddleware");
const {
    getProfileBySlug,
    checkFollowingStatus,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getProfileByUserId,
} = require("../controllers/profileController");

// 🛠 Kiểm tra trạng thái theo dõi
router.get("/:profileId/is-following", checkFollowingStatus);

// 📌 Theo dõi & hủy theo dõi trước
router.post("/follow/:profileId", followUser);
router.delete("/unfollow/:profileId", unfollowUser);

// 📌 Lấy danh sách followers & following
router.get("/followers/:profileId", getFollowers);
router.get("/following/:profileId", getFollowing);

// 📌 Lấy profile đầy đủ theo username
router.get("/:slug", getProfileBySlug);
router.put("/:username", auth, updateProfileByUsername);
router.get("/username/:username", getProfileByUsername);
router.get("/user/:userId", getProfileByUserId);

module.exports = router;
