const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Tạo thư mục upload nếu chưa tồn tại
const messageUploadDir = path.join(__dirname, "../uploads/messages");
if (!fs.existsSync(messageUploadDir)) {
    fs.mkdirSync(messageUploadDir, { recursive: true });
}

// Cấu hình storage cho Multer
const messageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, messageUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".gif", ".mp4"].includes(ext)) {
            const uniqueSuffix = Date.now();
            cb(null, `${uniqueSuffix}${ext}`);
        } else {
            const originalName = Buffer.from(
                file.originalname,
                "latin1"
            ).toString("utf8");
            cb(null, originalName);
        }
    },
});

// Bộ lọc file cho phép
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "audio/webm", // <-- Thêm audio
        "audio/mpeg", // mp3
        "audio/wav", // wav
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Định dạng file không được hỗ trợ"), false);
    }
};

// Middleware upload cho phép nhiều file
const uploadMessageFiles = multer({
    storage: messageStorage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB/file
        files: 10,
    },
}).array("messages");

module.exports = uploadMessageFiles;
