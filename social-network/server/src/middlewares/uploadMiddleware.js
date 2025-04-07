const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/posts');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
    fileFilter: (req, file, cb) => {
        // Cho phép một số định dạng ảnh và video
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Loại file không được hỗ trợ!'), false);
        }
    },
});

module.exports = upload;
