const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Profile = require('../models/Profile');
const User = require('../models/User');

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
            images: files.map((file) => '/uploads/posts/' + file.filename), // Đường dẫn đúng
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
        const userId = req.params.id;
        const currentUserId = req.user.id;

        // Lấy profile của current user để kiểm tra danh sách following
        const currentProfile = await Profile.findOne({
            userId: currentUserId,
        }).select('following');
        if (!currentProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Nếu là bài viết của chính mình
        if (userId === currentUserId.toString()) {
            const posts = await Post.find({ userId })
                .populate('userId', 'username profilePicture')
                .sort({ createdAt: -1 });
            return res.json(posts);
        }

        // Kiểm tra xem có đang follow user đó không
        const isFollowing =
            Array.isArray(currentProfile.following) &&
            currentProfile.following.includes(userId);

        // Kiểm tra xem user mục tiêu có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Nếu không follow thì chỉ xem được bài viết public
        let query = { userId };
        if (!isFollowing) {
            query.visibility = 'public';
        }

        const posts = await Post.find(query)
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error('Error in getUserPosts:', err);
        res.status(500).json({ message: err.message });
    }
};

// Lấy tất cả bài viết (chỉ hiện bài của mình và người mình follow)
exports.getAllPosts = async (req, res) => {
    try {
        // 1. Lấy thông tin profile của user hiện tại
        console.log('Current user ID:', req.user.id);
        const currentProfile = await Profile.findOne({
            userId: req.user.id,
        }).select('following');
        if (!currentProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // 2. Tìm các bài post theo điều kiện
        const posts = await Post.find({
            $or: [
                { userId: req.user._id }, // Bài viết của chính mình
                {
                    userId: { $in: currentProfile.following }, // Bài viết của người mình follow
                    visibility: { $in: ['public', 'followers'] },
                },
                {
                    visibility: 'public', // Bài viết public của mọi người
                },
            ],
        })
            .populate('userId', 'username avatar') // Populate thông tin người đăng
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error('Error in getAllPosts:', err);
        res.status(500).json({ message: err.message });
    }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Sửa post.user thành post.userId
        if (!post || !post.userId.equals(req.user._id)) {
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
        const { content } = req.body;
        const newComment = new Comment({
            userId: req.user._id,
            postId: req.params.postId,
            content,
            createdAt: Date.now(),
        });

        const savedComment = await newComment.save();
        await savedComment.populate('userId', 'username profilePicture');
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Thêm reply vào comment:
exports.addReply = async (req, res) => {
    try {
        const { content } = req.body;
        const newReply = new Comment({
            userId: req.user._id,
            postId: req.params.postId,
            content,
            replyTo: req.params.commentId,
        });

        const savedReply = await newReply.save();
        await savedReply.populate('userId', 'username profilePicture');
        res.status(201).json(savedReply);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Like/Unlike comment
exports.toggleCommentLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment)
            return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user._id;
        const index = comment.likes.indexOf(userId);

        if (index === -1) {
            comment.likes.push(userId);
        } else {
            comment.likes.splice(index, 1);
        }

        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
