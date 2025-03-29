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
        const { fullName, bio, avatar } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { username: req.params.username },
            { fullName, bio, avatar },
            { new: true }
        );

        if (!profile)
            return res.status(404).json({ message: "Profile không tồn tại!" });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};
