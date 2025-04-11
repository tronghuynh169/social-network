const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Tạo thư mục nếu chưa có
const messageUploadDir = path.join(__dirname, "../uploads/messages");
if (!fs.existsSync(messageUploadDir)) {
    fs.mkdirSync(messageUploadDir, { recursive: true });
}

// Cấu hình Multer
const messageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, messageUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const uploadMessageImage = multer({ storage: messageStorage }).single("image");

module.exports = uploadMessageImage;
