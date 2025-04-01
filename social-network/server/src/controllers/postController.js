const Post = require('../models/Post');

// Đăng bài viết (Sửa để upload nhiều ảnh)
exports.createPost = async (req, res) => {
    try {
        // Xử lý nhiều file upload
        const files = req.files; // Đổi từ req.file sang req.files
        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ message: 'Vui lòng chọn ít nhất 1 ảnh' });
        }
        const newPost = new Post({
            userId: req.user.id,
            imageUrls: files.map((file) => '/uploads/posts/' + file.filename), // Đường dẫn đúng
            caption: req.body.caption,
            visibility: req.body.visibility || 'public',
        });

        await newPost.save();
        res.status(201).json({ message: 'Bài viết đã đăng!', post: newPost });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng bài!', error });
    }
};

// Lấy tất cả bài viết của chính mình hoặc của một user cụ thể
exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        // Sửa 'user' thành 'userId' trong query
        const posts = await Post.find({ userId: userId })
            .populate('userId', 'username profilePic') // Sửa thành populate userId
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi tải bài viết của user!',
            error,
        });
    }
};

// Lấy tất cả bài viết (chỉ hiện bài của mình và người mình follow)
exports.getAllPosts = async (req, res) => {
    try {
        // Thêm populate userId thay vì user
        const posts = await Post.find()
            .populate('userId', 'username profilePic followers')
            .sort({ createdAt: -1 });

        const filteredPosts = posts.filter((post) => {
            // Kiểm tra quyền xem bài viết
            if (post.visibility === 'public') return true;
            if (post.userId._id.toString() === req.user.id) return true;
            return post.userId.followers.includes(req.user.id);
        });

        res.status(200).json(filteredPosts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tải bài viết!', error });
    }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Sửa post.user thành post.userId
        if (!post || post.userId.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ message: 'Bạn không có quyền xóa bài này!' });
        }
        await post.deleteOne();
        res.status(200).json({ message: 'Bài viết đã bị xóa!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa bài viết!', error });
    }
};

// Like / unlike bài viết
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: 'Bài viết không tồn tại' });

        const userId = req.user.id;
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.status(200).json({ message: 'Thành công!', post });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi like bài viết', error });
    }
};

// Thêm comment
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: 'Bài viết không tồn tại' });

        const newComment = {
            userId: req.user.id,
            text: req.body.text,
            createdAt: Date.now(),
        };

        post.comments.push(newComment);
        await post.save();

        res.status(201).json({
            message: 'Đã thêm bình luận',
            comment: newComment,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm bình luận', error });
    }
};

//Thêm reply vào comment:
exports.addReply = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: 'Bài viết không tồn tại' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment)
            return res.status(404).json({ message: 'Bình luận không tồn tại' });

        const newReply = {
            userId: req.user.id,
            text: req.body.text,
            createdAt: Date.now(),
        };

        comment.replies.push(newReply);
        await post.save();

        res.status(201).json({ message: 'Đã thêm phản hồi', reply: newReply });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm phản hồi', error });
    }
};

// Like/Unlike comment
exports.toggleCommentLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: 'Bài viết không tồn tại' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment)
            return res.status(404).json({ message: 'Bình luận không tồn tại' });

        const userId = req.user.id;
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex === -1) {
            comment.likes.push(userId);
        } else {
            comment.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.status(200).json({ message: 'Thành công!', comment });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi like bình luận', error });
    }
};

// Like/Unlike reply
exports.toggleReplyLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: 'Bài viết không tồn tại' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment)
            return res.status(404).json({ message: 'Bình luận không tồn tại' });

        const reply = comment.replies.id(req.params.replyId);
        if (!reply)
            return res.status(404).json({ message: 'Phản hồi không tồn tại' });

        const userId = req.user.id;
        const likeIndex = reply.likes.indexOf(userId);

        if (likeIndex === -1) {
            reply.likes.push(userId);
        } else {
            reply.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.status(200).json({ message: 'Thành công!', reply });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi like phản hồi', error });
    }
};
