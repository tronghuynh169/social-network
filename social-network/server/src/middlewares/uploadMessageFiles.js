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
        
        // Nếu là hình ảnh hoặc video, dùng timestamp để tạo tên duy nhất
        if ([".jpg", ".jpeg", ".png", ".gif", ".mp4"].includes(ext)) {
            const uniqueSuffix = Date.now();
            cb(null, `${uniqueSuffix}${ext}`); // Sử dụng timestamp cho hình ảnh và video
        } else {
            // Nếu là tài liệu (Word, PDF...), giữ nguyên tên gốc
            const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
            cb(null, originalName); // Giữ tên gốc cho tài liệu
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
