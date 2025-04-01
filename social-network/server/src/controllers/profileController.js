const mongoose = require("mongoose"); // Thêm dòng này
const Profile = require("../models/Profile");
const User = require("../models/User");

// Lấy profile theo username
exports.getProfileBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const profile = await Profile.findOne({ slug });

        if (!profile) {
            return res.status(404).json({ message: "Không tìm thấy profile" });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error("🔥 Lỗi khi lấy profile:", err);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau." });
    }
};

// Cập nhật profile theo username
exports.updateProfileByUsername = async (req, res) => {
    try {
        const { bio, website, location, gender } = req.body;
        const { username } = req.params; // ✅ Lấy username từ URL

        const profile = await Profile.findOneAndUpdate(
            { username }, // 🔥 Điều kiện tìm kiếm theo username
            { bio, website, location, gender }, // 🔥 Dữ liệu cần cập nhật
            { new: true } // 🔥 Trả về dữ liệu mới sau khi cập nhật
        );

        if (!profile)
            return res.status(404).json({ message: "Profile không tồn tại!" });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

exports.getProfileByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const profile = await Profile.findOne({ username });

        if (!profile) {
            return res.status(404).json({ message: "Không tìm thấy profile" });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error("🔥 Lỗi khi lấy profile:", err);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau." });
    }
};

exports.getProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.params.userId });
        if (!profile)
            return res.status(404).json({ message: "Không tìm thấy profile" });
        res.json(profile);
    } catch (error) {
        console.error("Lỗi khi lấy profile:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.checkFollowingStatus = async (req, res) => {
    try {
        const { user } = req.query;
        const profile = await Profile.findById(user);
        if (!profile) {
            return res
                .status(404)
                .json({ message: "User không tồn tại", isFollowing: false });
        }
        const isFollowing = profile.following.includes(req.params.profileId);
        res.json({ isFollowing });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const { userProfileId } = req.body; // ID của user thực hiện follow
        const profileToFollow = await Profile.findById(req.params.profileId); // abc123
        const currentUserProfile = await Profile.findById(userProfileId); // BFNGOC
        if (!profileToFollow || !currentUserProfile) {
            console.error("❌ Không tìm thấy profile:", {
                userProfileId,
                profileId: req.params.profileId,
            });
            return res.status(404).json({ message: "Profile không tồn tại" });
        }

        // Kiểm tra nếu chưa follow thì mới thêm
        if (
            !currentUserProfile.following.includes(
                profileToFollow._id.toString()
            )
        ) {
            currentUserProfile.following.push(profileToFollow._id.toString()); // Đúng ✅
            profileToFollow.followers.push(currentUserProfile._id.toString()); // Sửa lỗi ✅
            await currentUserProfile.save();
            await profileToFollow.save();
        }

        res.status(200).json({
            message: "Đã theo dõi",
            following: currentUserProfile.following,
        });
    } catch (err) {
        console.error("🔥 Lỗi khi theo dõi:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// ✅ Hủy theo dõi người dùng
exports.unfollowUser = async (req, res) => {
    try {
        const { currentUserId } = req.body; // Đổi từ userProfileId thành currentUserId
        const profileToUnfollow = await Profile.findById(req.params.profileId);
        const currentUserProfile = await Profile.findById(currentUserId);

        if (!profileToUnfollow || !currentUserProfile) {
            console.error("❌ Unfollow Error - Profile not found:", {
                profileToUnfollow: req.params.profileId,
                currentUserProfile: currentUserId,
            });
            return res.status(404).json({ message: "Profile không tồn tại" });
        }

        await Profile.findByIdAndUpdate(
            currentUserId,
            { $pull: { following: profileToUnfollow._id } },
            { new: true }
        );

        await Profile.findByIdAndUpdate(
            profileToUnfollow._id,
            { $pull: { followers: currentUserId } },
            { new: true }
        );

        res.status(200).json({
            message: "Đã hủy theo dõi",
            following: currentUserProfile.following,
        });
    } catch (err) {
        console.error("🔥 Lỗi server khi hủy theo dõi:", {
            error: err.message,
            stack: err.stack,
            params: req.params,
            body: req.body,
        });
        res.status(500).json({
            message: "Lỗi server",
            error: err.message,
            details: err.stack,
        });
    }
};

// ✅ Lấy danh sách người theo dõi
exports.getFollowers = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.profileId).populate(
            "followers",
            "username fullName avatar"
        );
        if (!profile)
            return res.status(404).json({ message: "Profile không tồn tại" });

        res.status(200).json({ followers: profile.followers });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// ✅ Lấy danh sách đang theo dõi
exports.getFollowing = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.profileId).populate(
            "following",
            "username fullName avatar"
        );
        if (!profile)
            return res.status(404).json({ message: "Profile không tồn tại" });

        res.status(200).json({ following: profile.following });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { bio, website, location, gender } = req.body;
        const { profileId } = req.params;

        console.log("📌 Profile ID nhận được:", profileId);

        // Kiểm tra profileId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(profileId)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        // Tìm profile và cập nhật
        const updatedProfile = await Profile.findByIdAndUpdate(
            profileId,
            { $set: { bio, website, location, gender } },
            { new: true, runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: "Không tìm thấy profile" });
        }

        res.status(200).json({
            message: "Cập nhật profile thành công",
            profile: updatedProfile,
        });
    } catch (err) {
        console.error("🔥 Lỗi khi cập nhật profile:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};
