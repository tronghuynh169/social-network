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
        // Tạo tên file: timestamp + extension
        const uniqueSuffix = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
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
        fileSize: 20 * 1024 * 1024, // Giới hạn 20MB/file
        files: 10, // Tối đa 10 file
    },
}).array("messages"); // Sử dụng field name "messages"

module.exports = uploadMessageFiles;
