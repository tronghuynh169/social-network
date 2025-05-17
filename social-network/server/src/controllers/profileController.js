const mongoose = require("mongoose"); // Thêm dòng này
const Profile = require("../models/Profile");
const User = require("../models/User");
const removeAccents = require("remove-accents");

// ✅ Lấy tất cả profile
exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().select(
            "username fullName avatar slug userId"
        );
        res.status(200).json(profiles);
    } catch (err) {
        console.error("🔥 Lỗi khi lấy danh sách profile:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

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

exports.getProfileByFullName = async (req, res) => {
    try {
        let { fullname } = req.params;

        // Kiểm tra nếu fullname không có giá trị hoặc là chuỗi rỗng
        if (!fullname || fullname.trim() === "") {
            return res.json([]); // Trả về mảng rỗng nếu không có fullname
        }

        // Bỏ dấu + chuẩn hóa từ khóa tìm kiếm
        const keyword = removeAccents(
            fullname.toLowerCase().trim().replace(/\s+/g, " ")
        );

        // Tìm kiếm với regex an toàn hơn (tránh injection)
        const regex = new RegExp(
            keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        const profiles = await Profile.find({
            fullNameUnsigned: { $regex: regex }, // Sử dụng trường đã được xử lý sẵn (khuyến nghị)
        }).limit(5);

        // Nếu không tìm thấy profile, trả về mảng rỗng
        if (!profiles.length) {
            return res.json([]); // Trả về mảng rỗng thay vì thông báo lỗi
        }

        res.json(profiles);
    } catch (err) {
        // Tránh lỗi 500, và trả về mảng rỗng nếu có lỗi server
        console.error("Lỗi:", err);
        return res.json([]); // Trả về mảng rỗng thay vì lỗi
    }
};

exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findById(id);

        if (!profile) {
            return res.status(404).json({ message: "Không tìm thấy profile" });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error("🔥 Lỗi khi lấy profile theo ID:", err);
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
        const { user } = req.query; // user chính là currentUserId
        const { profileId } = req.params; // profileId là ID người cần kiểm tra follow

        if (!user || !profileId) {
            return res
                .status(400)
                .json({ message: "Thiếu user hoặc profileId!" });
        }

        const profile = await Profile.findById(user);
        if (!profile) {
            return res
                .status(404)
                .json({ message: "User không tồn tại", isFollowing: false });
        }

        const isFollowing = profile.following.includes(profileId);

        res.json({ isFollowing });
    } catch (err) {
        console.error("❌ Lỗi server:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const { userProfileId } = req.body;
        const profileToFollow = await Profile.findById(req.params.profileId);
        const currentUserProfile = await Profile.findById(userProfileId);

        if (!profileToFollow || !currentUserProfile) {
            console.error("❌ Không tìm thấy profile:", {
                userProfileId,
                profileId: req.params.profileId,
            });
            return res.status(404).json({ message: "Profile không tồn tại" });
        }

        if (
            !currentUserProfile.following.includes(
                profileToFollow._id.toString()
            )
        ) {
            currentUserProfile.following.push(profileToFollow._id.toString());
            profileToFollow.followers.push(currentUserProfile._id.toString());
            await currentUserProfile.save();
            await profileToFollow.save();

            const Notification = require("../models/Notification");
            const notify = new Notification({
                user: profileToFollow._id,
                sender: currentUserProfile._id,
                type: "follow",
                content: `${currentUserProfile.fullName} đã theo dõi bạn.`,
                data: {
                    followerId: currentUserProfile._id,
                    slug: currentUserProfile.slug,
                },
            });
            const savedNotify = await notify.save();

            if (req.app && req.app.get && req.app.get("io")) {
                req.app
                    .get("io")
                    .to(profileToFollow._id.toString())
                    .emit("newNotification", savedNotify);
            } else {
                console.log("Không tìm thấy io instance trong app");
            }
        } else {
            console.log("Đã follow từ trước, không thực hiện lại");
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
        const { currentUserId } = req.body;
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

        // === THÊM ĐOẠN NÀY BÊN DƯỚI ===
        const Notification = require("../models/Notification");
        const notify = new Notification({
            user: profileToUnfollow._id,
            sender: currentUserProfile._id,
            type: "unfollow",
            content: `${currentUserProfile.fullName} đã hủy theo dõi bạn.`,
            data: {
                unfollowerId: currentUserProfile._id,
                slug: currentUserProfile.slug,
            },
        });
        const savedNotify = await notify.save();

        if (req.app && req.app.get && req.app.get("io")) {
            req.app
                .get("io")
                .to(profileToUnfollow._id.toString())
                .emit("newNotification", savedNotify);
        }
        // =============================

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
            "username fullName avatar slug"
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
            "username fullName avatar userId slug _id"
        );
        if (!profile)
            return res.status(404).json({ message: "Profile không tồn tại" });

        res.status(200).json({ following: profile.following });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};
