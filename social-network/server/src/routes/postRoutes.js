const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    createPost,
    getAllPosts,
    getUserPosts,
    deletePost,
    toggleLike,
    addComment,
    addReply,
    toggleCommentLike,
    toggleReplyLike,
} = require('../controllers/postController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// Cấu hình Multer
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
});

// Routes
router.post(
    '/',
    auth,
    upload.array('images', 10),
    (req, res, next) => {
        console.log('Uploaded files:', req.files);
        next();
    },
    createPost
); // Cho phép tối đa 10 ảnh
router.get('/', auth, getAllPosts); // API lấy bài viết của mình và người mình follow
router.get('/user/:id', auth, getUserPosts); // API lấy bài viết của một user
router.delete('/:id', auth, deletePost);
router.post('/:postId/like', auth, toggleLike);
router.post('/:postId/comments', auth, addComment);
router.post('/:postId/comments/:commentId/replies', auth, addReply);
router.post('/:postId/comments/:commentId/like', auth, toggleCommentLike);
router.post(
    '/:postId/comments/:commentId/replies/:replyId/like',
    auth,
    toggleReplyLike
);

module.exports = router;
