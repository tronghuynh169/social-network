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
    getProfileByFullName,
} = require("../controllers/profileController");

// 1️⃣ Route đặc biệt (có prefix rõ ràng)
router.get("/user/:userId", auth, getProfileByUserId); // /api/profile/user/123
router.get("/username/:username", auth, getProfileByUsername); // /api/profile/username/bfngoc
router.get("/fullname/:fullname", auth, getProfileByFullName); // /api/profile/fullname/Nguyen Van A
router.put("/username/:username", auth, updateProfileByUsername); // /api/profile/username/bfngoc

// 2️⃣ Follow/unfollow routes
router.post("/follow/:profileId", auth, followUser); // /api/profile/follow/123
router.delete("/unfollow/:profileId", auth, unfollowUser); // /api/profile/unfollow/123
router.get("/:profileId/is-following", auth, checkFollowingStatus);

// 3️⃣ Followers/following lists
router.get("/:profileId/followers", auth, getFollowers); // /api/profile/123/followers
router.get("/:profileId/following", auth, getFollowing); // /api/profile/123/following

// 4️⃣ Route tổng quát (slug) - ĐẶT CUỐI CÙNG
router.get("/:slug", auth, getProfileBySlug); // /api/profile/bfngoc-slug

module.exports = router;
