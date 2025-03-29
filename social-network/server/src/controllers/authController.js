const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Profile = require("../models/Profile"); // Import model Profile
const slugify = require("slugify");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Địa chỉ email gửi
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
    },
});
// Đăng ký tài khoản

const generateUniqueSlug = async (fullName) => {
    let slug = slugify(fullName, { lower: true, strict: true });
    let newSlug = slug;
    let count = 1;

    // Lặp đến khi tìm được slug chưa tồn tại
    while (await User.findOne({ slug: newSlug })) {
        newSlug = `${slug}-${count}`;
        count++;
    }

    return newSlug;
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, fullName, dateOfBirth } = req.body;
        let errors = {};

        // Kiểm tra username hoặc email đã tồn tại chưa
        if (await User.findOne({ username })) {
            errors.username = "Tên tài khoản đã tồn tại";
        }
        if (await User.findOne({ email })) {
            errors.email = "Email đã được sử dụng";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Tạo slug từ fullName và đảm bảo không trùng
        const slug = await generateUniqueSlug(fullName);

        // 🔥 Tạo user mới
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            dateOfBirth,
            slug, // Lưu slug vào database
        });

        await newUser.save();

        // ✅ Tạo profile mặc định cho user mới
        const newProfile = new Profile({
            userId: newUser._id,
            username,
            fullName,
            slug, // Lưu slug vào Profile
            bio: "Chưa có giới thiệu.",
            avatar: "/DefaultAvatar.png",
        });

        await newProfile.save();

        res.status(201).json({
            message: "Đăng ký thành công!",
            user: newUser,
            profile: newProfile,
        });
    } catch (err) {
        console.error("🔥 Lỗi:", err);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau." });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        // Tìm user bằng username hoặc email
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });

        if (!user) {
            return res.status(400).json({ message: "Tài khoản không tồn tại" });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({ message: "Mật khẩu không chính xác" });
        }

        // Tạo token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                slug: user.slug,
                email: user.email,
                fullName: user.fullName, // Thêm thông tin fullName
                avatar: user.avatar, // Thêm avatar
                role: user.role, // Thêm quyền
                createdAt: user.createdAt, // Thêm thời gian tạo tài khoản
            },
        });
    } catch (err) {
        console.error("Lỗi server:", err); // ✅ Debug
        res.status(500).json({ error: err.message });
    }
};

//Get user
exports.getUser = (req, res) => {
    res.json({ message: "User authenticated", userId: req.user.id });
};

// ✅ Gửi email đặt lại mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Đặt lại mật khẩu",
            html: `<p>Bấm vào link dưới để đặt lại mật khẩu:</p>
                   <a href="${resetLink}">${resetLink}</a>`,
        });

        res.json({ message: "Email đặt lại mật khẩu đã được gửi!" });
    } catch (error) {
        console.error("🔥 Lỗi chi tiết:", error); // ✅ In lỗi ra console
        res.status(500).json({
            message: "Lỗi hệ thống!",
            error: error.message,
        });
    }
};

// ✅ Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        console.log("Receiving request with token:", req.params.token);
        console.log("New Password:", req.body.password);

        // Xác minh token
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        if (!decoded)
            return res.status(400).json({ message: "Token không hợp lệ!" });

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Chỉ cập nhật mật khẩu, giữ nguyên các trường khác
        const user = await User.findByIdAndUpdate(
            decoded.id,
            { password: hashedPassword },
            { new: true, runValidators: false } // Tắt validate để tránh lỗi thiếu field
        );

        if (!user)
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại!" });

        res.json({ message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi đặt lại mật khẩu:", error);
        res.status(500).json({
            message: "Lỗi hệ thống!",
            error: error.message,
        });
    }
};
