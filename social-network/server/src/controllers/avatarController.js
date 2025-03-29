const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Profile = require("../models/Profile");

// Tạo thư mục `uploads/` nếu chưa có
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu ảnh vào thư mục
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage }).single("image");

// ✅ API cập nhật avatar theo `slug`
exports.updateAvatar = async (req, res) => {
    upload(req, res, async (err) => {
        if (err)
            return res.status(500).json({ message: "Lỗi upload", error: err });

        if (!req.file)
            return res
                .status(400)
                .json({ message: "Không có ảnh nào được gửi lên" });

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        try {
            const { slug } = req.body; // Nhận slug từ request

            // Tìm profile theo slug và cập nhật avatar
            const profile = await Profile.findOneAndUpdate(
                { slug },
                { avatar: imageUrl },
                { new: true }
            );

            if (!profile) {
                return res
                    .status(404)
                    .json({ message: "Không tìm thấy profile" });
            }

            res.status(200).json({
                message: "Cập nhật avatar thành công",
                imageUrl: profile.avatar,
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error });
        }
    });
};

exports.deleteAvatar = async (req, res) => {
    try {
        const { slug } = req.params;

        // Lấy thông tin profile từ database
        const profile = await Profile.findOne({ slug });

        if (!profile || !profile.avatar) {
            return res.status(404).json({
                success: false,
                message: "Avatar not found",
            });
        }

        const avatarUrl = profile.avatar;
        const defaultAvatar = "http://localhost:5173/images/default-avatar.png";

        // Kiểm tra nếu avatar hiện tại là ảnh mặc định thì không xóa
        if (avatarUrl === defaultAvatar) {
            return res.json({
                success: true,
                message: "Avatar is already default",
                imageUrl: defaultAvatar,
            });
        }

        // Xóa file avatar thật (nếu tồn tại)
        const filename = path.basename(avatarUrl);
        const avatarPath = path.join(uploadDir, filename);
        if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
        }

        // Cập nhật profile, đặt avatar về ảnh mặc định
        await Profile.findOneAndUpdate({ slug }, { avatar: defaultAvatar });

        return res.json({
            success: true,
            message: "Avatar deleted",
            imageUrl: defaultAvatar,
        });
    } catch (error) {
        console.error("Lỗi khi xóa avatar:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
