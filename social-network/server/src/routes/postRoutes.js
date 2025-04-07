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
    getPostDetails,
} = require('../controllers/postController');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

// Routes
router.post(
    '/',
    auth,
    upload.array('files', 10),
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
router.get('/:postId/details', getPostDetails);

module.exports = router;
