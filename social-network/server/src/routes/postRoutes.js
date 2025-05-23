const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    createPost,
    getAllPosts,
    getUserPosts,
    toggleLike,
    addComment,
    addReply,
    toggleCommentLike,
    getPostDetails,
    getPostLikes,
    getCommentLikes,
    deleteComment,
    deletePost,
    updatePost,
    getUserPostCount,
    getReplyProfile,
    getReplyToChain,
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
router.get('/user/:id/count', auth, getUserPostCount);
router.delete('/:postId', auth, deletePost);
router.put(
    '/:postId',
    auth,
    upload.array('newFiles', 10),
    (req, res, next) => {
        console.log('Uploaded files:', req.files);
        next();
    },
    updatePost
);
router.get('/comments/:replyToId/reply-profile', auth, getReplyProfile);
router.get('/comments/:commentId/reply-chain', getReplyToChain);
router.post('/:postId/like', auth, toggleLike);
router.get('/:postId/likes', getPostLikes);
router.get('/:postId/comments/:commentId/likes', getCommentLikes);
router.post('/:postId/comments', auth, addComment);
router.post('/:postId/comments/:commentId/replies', auth, addReply);
router.post('/:postId/comments/:commentId/like', auth, toggleCommentLike);
router.get('/:postId/details', auth, getPostDetails);
router.delete('/:postId/comments/:commentId', deleteComment);
module.exports = router;
