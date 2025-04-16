const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Profile = require("../models/Profile");
const User = require("../models/User");
const mongoose = require("mongoose");
// Đăng bài viết (Sửa để upload nhiều ảnh)
exports.createPost = async (req, res) => {
    try {
        const { caption, visibility } = req.body;
        const files = req.files;

        if (
            (!files || files.length === 0) &&
            (!caption || caption.trim() === "")
        ) {
            return res.status(400).json({
                message:
                    "Vui lòng cung cấp ít nhất một nội dung: caption hoặc ảnh/video",
            });
        }

        let media = [];

        if (files && files.length > 0) {
            media = files.map((file) => ({
                type: file.mimetype.startsWith("image/") ? "image" : "video",
                url: "/uploads/posts/" + file.filename,
            }));
        }

        const newPost = new Post({
            userId: req.user.id,
            caption: caption || "",
            media,
            visibility: visibility || "public",
        });

        await newPost.save();

        const postUrl = `http://localhost:5173/posts/${newPost._id}`;
        res.status(201).json({
            message: "Bài viết đã đăng!",
            post: newPost,
            link: postUrl,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi đăng bài!", error });
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
        }).select("following");
        if (!currentProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Nếu là bài viết của chính mình
        if (userId === currentUserId.toString()) {
            const posts = await Post.find({ userId })
                .populate("userId", "username profilePicture")
                .sort({ createdAt: -1 });
            const modifiedPosts = posts.map((post) => {
                const isLiked = post.likes.includes(currentUserId);
                return {
                    ...post.toObject(),
                    isLiked,
                };
            });

            return res.json(modifiedPosts);
        }

        // Kiểm tra xem có đang follow user đó không
        const isFollowing =
            Array.isArray(currentProfile.following) &&
            currentProfile.following.includes(userId);

        // Kiểm tra xem user mục tiêu có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Nếu không follow thì chỉ xem được bài viết public
        let query = { userId };
        if (!isFollowing) {
            query.visibility = "public";
        }

        const posts = await Post.find(query)
            .populate("userId", "username profilePicture")
            .sort({ createdAt: -1 });

        const modifiedPosts = posts.map((post) => {
            const isLiked = post.likes.includes(currentUserId);
            return {
                ...post.toObject(),
                isLiked,
            };
        });

        return res.json(modifiedPosts);
    } catch (err) {
        console.error("Error in getUserPosts:", err);
        res.status(500).json({ message: err.message });
    }
};

// Lấy tất cả bài viết (chỉ hiện bài của mình và người mình follow)
exports.getAllPosts = async (req, res) => {
    try {
        // 1. Lấy thông tin profile hiện tại
        const currentProfile = await Profile.findOne({
            userId: req.user.id,
        }).select("following");

        if (!currentProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // 2. Lấy userId của những người mình follow
        const followedProfiles = await Profile.find({
            _id: { $in: currentProfile.following },
        }).select("userId");

        const followedUserIds = followedProfiles.map(
            (profile) => profile.userId
        );

        // 3. Truy vấn bài viết theo 3 nhóm:
        const posts = await Post.find({
            $or: [
                // Bài viết của chính mình
                { userId: req.user.id },

                // Bài viết của người mình follow (public hoặc followers)
                {
                    userId: { $in: followedUserIds },
                    visibility: { $in: ["public", "followers"] },
                },

                // Bài viết public của người mình không follow
                {
                    userId: { $nin: followedUserIds.concat(req.user.id) },
                    visibility: "public",
                },
            ],
        })
            .sort({ createdAt: -1 })
            .populate("userId", "username avatar");

        const userId = req.user.id;
        const modifiedPosts = posts.map((post) => {
            const isLiked = post.likes.includes(userId);
            return {
                ...post.toObject(),
                isLiked,
            };
        });

        res.json(modifiedPosts);
    } catch (err) {
        console.error("Error in getAllPosts:", err);
        res.status(500).json({ message: err.message });
    }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Sửa post.user thành post.userId
        if (!post || !post.userId.equals(req.user.id)) {
            return res
                .status(403)
                .json({ message: "Bạn không có quyền xóa bài này!" });
        }
        await post.deleteOne();
        res.status(200).json({ message: "Bài viết đã bị xóa!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bài viết!", error });
    }
};

// Like / unlike bài viết
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: "Bài viết không tồn tại" });

        const userId = req.user.id;
        const likeIndex = post.likes.indexOf(userId);
        let isLiked;

        if (likeIndex === -1) {
            post.likes.push(userId);
            isLiked = true;
        } else {
            post.likes.splice(likeIndex, 1);
            isLiked = false;
        }

        await post.save();

        res.status(200).json({
            message: "Thành công!",
            isLiked,
            likesCount: post.likes.length,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi like bài viết", error });
    }
};

// Thêm comment
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const newComment = new Comment({
            userId: req.user.id,
            postId: req.params.postId,
            content,
            createdAt: Date.now(),
        });

        const savedComment = await newComment.save();
        await savedComment.populate("userId", "username profilePicture");
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
            userId: req.user.id,
            postId: req.params.postId,
            content,
            replyTo: req.params.commentId,
        });

        const savedReply = await newReply.save();
        await savedReply.populate("userId", "username profilePicture");
        res.status(201).json(savedReply);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Toggle like bình luận
exports.toggleCommentLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment)
            return res.status(404).json({ message: "Comment not found" });

        const userId = req.user.id;
        const index = comment.likes.indexOf(userId);
        let isLiked;

        if (index === -1) {
            comment.likes.push(userId);
            isLiked = true;
        } else {
            comment.likes.splice(index, 1);
            isLiked = false;
        }

        await comment.save(); // 👈 Quan trọng: cập nhật xong rồi mới tính

        // Sau khi save, mới tính đúng số lượng và trạng thái
        res.status(200).json({
            isLikedComment: isLiked,
            likesCommentCount: comment.likes.length,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API lấy chi tiết bài viết, bao gồm danh sách like và comment (với nested reply)
exports.getPostDetails = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res
                .status(400)
                .json({ message: "ID bài viết không hợp lệ" });
        }
        // Tìm bài viết theo postId và populate thông tin người đăng
        const post = await Post.findById(postId)
            .populate("userId", "username profilePicture")
            .lean();

        if (!post) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }

        const ownerProfile = await Profile.findOne({
            userId: post.userId._id,
        }).lean();

        // Lấy danh sách like: Giả sử post.likes chứa mảng userId
        const likeUsers = await User.find({ _id: { $in: post.likes } })
            .select("username profilePicture")
            .lean();

        for (let user of likeUsers) {
            const profile = await Profile.findOne({ userId: user._id }).lean();
            user.fullName = profile?.fullName || "";
            user.avatar = profile?.avatar || "";
        }

        // Lấy tham số phân trang (pagination) từ query parameters
        const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
        const limit = parseInt(req.query.limit) || 10; // Số lượng bình luận mỗi lần (mặc định là 10)

        // Lấy danh sách bình luận gốc (không là reply)
        const comments = await Comment.find({
            postId: postId,
            $or: [{ replyTo: { $exists: false } }, { replyTo: null }],
        })
            .populate("userId", "username profilePicture")
            .sort({ createdAt: 1 })
            .lean();

        // Với mỗi bình luận gốc, lấy nested replies (đệ quy)
        for (let comment of comments) {
            const profile = await Profile.findOne({
                userId: comment.userId._id,
            }).lean();
            comment.userId.fullName = profile?.fullName || "";
            comment.userId.avatar = profile?.avatar || "";
            // Kiểm tra like comment
            comment.isLikedComment = comment.likes.some(
                (like) => like.toString() === userId
            );
            comment.likesCommentCount = comment.likes.length;
            comment.replies = await getReplies(comment._id);
        }

        const isLiked = post.likes.includes(req.user.id);
        post.isLiked = isLiked;

        const totalComments = await Comment.countDocuments({
            postId: postId,
            $or: [{ replyTo: { $exists: false } }, { replyTo: null }],
        });

        res.status(200).json({
            post,
            likes: likeUsers,
            comments,
            ownerProfile,
        });
    } catch (error) {
        console.error("🔥 Lỗi chi tiết:", error); // log toàn bộ object lỗi
        res.status(500).json({
            message: "Lỗi khi lấy chi tiết bài viết!",
            error,
        });
    }
};

// Hàm đệ quy lấy nested replies
const getReplies = async (commentId) => {
    const replies = await Comment.find({ replyTo: commentId })
        .populate("userId", "username") // chỉ cần userId để join Profile
        .sort({ createdAt: 1 })
        .lean();

    for (let reply of replies) {
        const profile = await Profile.findOne({
            userId: reply.userId._id,
        }).lean();
        reply.userId.fullName = profile?.fullName || "";
        reply.userId.avatar = profile?.avatar || "";
        reply.replies = await getReplies(reply._id); // Đệ quy
    }

    return replies;
};

exports.getPostLikes = async (req, res) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }

        const likeUsers = await User.find({ _id: { $in: post.likes } })
            .select("username profilePicture")
            .lean();

        for (let user of likeUsers) {
            const profile = await Profile.findOne({ userId: user._id }).lean();
            user.fullName = profile?.fullName || "";
            user.avatar = profile?.avatar || "";
        }

        res.status(200).json({ likes: likeUsers });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách like bài viết", error });
    }
};

exports.getCommentLikes = async (req, res) => {
    try {
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Bình luận không tồn tại" });
        }

        const likeUsers = await User.find({ _id: { $in: comment.likes } })
            .select("username profilePicture")
            .lean();

        for (let user of likeUsers) {
            const profile = await Profile.findOne({ userId: user._id }).lean();
            user.fullName = profile?.fullName || "";
            user.avatar = profile?.avatar || "";
        }

        res.status(200).json({ likes: likeUsers });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách like bình luận", error });
    }
};
