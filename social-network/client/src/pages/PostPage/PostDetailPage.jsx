import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    getPostDetails,
    toggleLike,
    addComment,
    addReply,
    toggleCommentLike,
} from "~/api/post";
import {
    Heart,
    MessageCircle,
    Send,
    ChevronLeft,
    ChevronRight,
    X,
    MoreHorizontal,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getProfileByUserId } from "~/api/profile";
import { formatPostTime } from "~/components/utils/formatPostTime";
import { useUser } from "~/context/UserContext";
import { motion } from "framer-motion";
import { usePostContext } from "~/context/PostContext";
import LikesCommentModal from "~/components/ui/PostUI/Post/LikesCommentModal";
export default function PostDetailPage({ isModal = false }) {
    const { updatePostLike } = usePostContext(); // trong PostDetailPage
    const { user } = useUser();
    const { id: postId } = useParams();
    const navigate = useNavigate();
    const [info, setInfo] = useState();
    const [postDetails, setPostDetails] = useState(null);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [showCommentLikesModal, setShowCommentLikesModal] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [replyToUser, setReplyToUser] = useState(null);

    const handleSlideChange = (swiper) => {
        setAtStart(swiper.isBeginning);
        setAtEnd(swiper.isEnd);
    };

    const handleLike = async () => {
        try {
            const res = await toggleLike(postDetails.post._id);
            // Cập nhật local state của PostDetailPage
            setPostDetails((prev) => ({
                ...prev,
                post: {
                    ...prev.post,
                    isLiked: res.isLiked,
                },
                likesCount: res.likesCount,
            }));

            // Đồng bộ sang PostContext
            updatePostLike(postDetails.post._id, res.isLiked, res.likesCount);
        } catch (err) {
            console.error("Lỗi khi like:", err);
        }
    };

    const handleCommentLike = async (commentId) => {
        try {
            const res = await toggleCommentLike(
                postDetails.post._id,
                commentId
            );

            const { isLikedComment, likesCommentCount } = res.data;

            // Cập nhật lại các bình luận trong postDetails
            const updatedComments = postDetails.comments.map((comment) =>
                comment._id === commentId
                    ? { ...comment, isLikedComment, likesCommentCount }
                    : comment
            );

            // Cập nhật lại postDetails state với comments đã được cập nhật
            setPostDetails((prev) => ({
                ...prev,
                comments: updatedComments,
            }));
        } catch (err) {
            console.error("Lỗi khi like bình luận:", err);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        try {
            let newComment;
            if (replyTo) {
                newComment = await addReply(postDetails.post._id, replyTo, comment);
            } else {
                newComment = await addComment(postDetails.post._id, comment);
            }
    
            const profile = await getProfileByUserId(user.id);
    
            const fullComment = {
                ...newComment,
                content: comment,
                userId: {
                    _id: user.id,
                    username: user.username,
                    fullName: profile.fullName,
                    avatar: profile.avatar,
                },
                createdAt: new Date().toISOString(),
                isLikedComment: false,
                likesCommentCount: 0,
                replyTo,
            };
    
            setPostDetails((prev) => ({
                ...prev,
                comments: replyTo
                    ? prev.comments.map((comment) =>
                          comment._id === replyTo
                              ? {
                                    ...comment,
                                    replies: [...(comment.replies || []), fullComment],
                                }
                              : comment
                      )
                    : [...prev.comments, { ...fullComment, replies: [] }],
            }));
    
            setComment("");
            setReplyTo(null);
            setReplyToUser(null);
        } catch (err) {
            console.error("Lỗi khi bình luận:", err);
        }
    };

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const response = await getPostDetails(postId);
                const post = response.data.post;
                const comments = response.data.comments || [];

                setPostDetails(response.data); // giữ nguyên dữ liệu backend trả về
            } catch (error) {
                console.error("Error fetching post details:", error);
            }
        };

        fetchPostDetails();
    }, [postId, user.id]);

    useEffect(() => {
        if (postDetails?.ownerProfile) {
            setInfo(postDetails.ownerProfile);
        }
    }, [postDetails]);

    const handleClose = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (isModal) {
            document.body.classList.add("overflow-hidden");
            return () => {
                document.body.classList.remove("overflow-hidden");
            };
        }
    }, [isModal]);

    if (!postDetails) {
        return <div className="text-white p-4">Loading...</div>;
    }

    const hasMedia = postDetails?.post?.media?.length > 0;
    const isSingleVideo =
        postDetails.post.media?.length === 1 &&
        postDetails.post.media[0].type === "video";

    const modalContent = (
        <div
            className={`bg-[var(--secondary-color)] h-[90vh] w-full overflow-hidden flex
                ${
                    hasMedia
                        ? "max-w-5xl flex-col md:flex-row"
                        : "max-w-md flex-col"
                }
            `}
        >
            {isModal && (
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 z-20 text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            )}
            {/* Left: Media */}
            {/* Media */}
            {hasMedia && (
                <div className="md:w-1/2 flex items-center justify-center bg-black relative">
                    <Swiper
                        modules={[Pagination]}
                        pagination={{ clickable: true }}
                        grabCursor
                        spaceBetween={10}
                        slidesPerView={1}
                        className=""
                        onSwiper={setSwiperInstance}
                        onSlideChange={handleSlideChange}
                    >
                        {postDetails.post.media.map((media, index) => (
                            <SwiperSlide key={media._id || index}>
                                {media.type === "image" ? (
                                    <img
                                        src={`http://localhost:5000${media.url}`}
                                        alt={`Post media ${index}`}
                                        className="w-full h-[90vh] object-cover"
                                    />
                                ) : media.type === "video" ? (
                                    <video
                                        controls
                                        className="max-w-full max-h-[90vh] object-contain"
                                    >
                                        <source
                                            src={`http://localhost:5000${media.url}`}
                                            type="video/mp4"
                                        />
                                        Trình duyệt không hỗ trợ video.
                                    </video>
                                ) : null}
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {postDetails.post.media.length > 1 && !atStart && (
                        <button
                            onClick={() => swiperInstance.slidePrev()}
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full z-10"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                    )}
                    {postDetails.post.media.length > 1 && !atEnd && (
                        <button
                            onClick={() => swiperInstance.slideNext()}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full z-10"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    )}
                </div>
            )}

            {/* Right: Details */}
            <div
                className={`w-full ${
                    hasMedia ? "md:w-1/2" : "md:w-full"
                } max-w-[500px] min-h-[90vh] flex flex-col p-4 overflow-y-auto`}
            >
                {/* Caption + Info */}
                <div className="border-b-2 pb-2 border-[var(--border-color)]">
                    <div className="flex items-center space-x-3">
                        <img
                            src={info?.avatar || "/default-avatar.png"}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-semibold text-sm">
                                {info?.fullName}
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatPostTime(postDetails.post.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Caption */}
                    <div className="text-sm mt-4">
                        {postDetails.post.caption?.length > 100 ? (
                            <>
                                {showFullCaption
                                    ? postDetails.post.caption
                                    : `${postDetails.post.caption.slice(
                                          0,
                                          100
                                      )}...`}
                                <button
                                    onClick={() =>
                                        setShowFullCaption(!showFullCaption)
                                    }
                                    className="text-gray-400 ml-2 cursor-pointer hover:underline"
                                >
                                    {showFullCaption ? "thu gọn" : "xem thêm"}
                                </button>
                            </>
                        ) : (
                            <>{postDetails.post.caption}</>
                        )}
                    </div>
                </div>

                <div className="text-sm space-y-4 max-h-full overflow-y-auto pr-2 py-2 no-scrollbar">
                    {postDetails.comments
                        .filter((c) => !c.replyTo) // chỉ lấy comment gốc
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .map((c, idx) => (
                            <div key={c._id || idx}>
                                <div className="flex items-start gap-3 w-full">
                                    {/* Avatar */}
                                    <img
                                        src={
                                            c.userId?.avatar ||
                                            "/default-avatar.png"
                                        }
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />

                                    {/* Nội dung */}
                                    <div className="flex-1">
                                        <p className="text-sm leading-snug break-words break-all whitespace-pre-wrap">
                                            <span className="font-semibold">
                                                {c.userId.fullName ||
                                                    c.userId.username}
                                            </span>{" "}
                                            <span>{c.content}</span>
                                        </p>

                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                            <span>
                                                {formatPostTime(c.createdAt)}
                                            </span>

                                            {c.likesCommentCount > 0 && (
                                                <span
                                                    onClick={() =>
                                                        setShowCommentLikesModal(
                                                            true
                                                        )
                                                    }
                                                    className="hover:underline cursor-pointer"
                                                >
                                                    {c.likesCommentCount} lượt
                                                    thích
                                                </span>
                                            )}

                                            <span
                                                onClick={() => {
                                                    setReplyTo(c._id);
                                                    setReplyToUser(
                                                        c.userId.fullName ||
                                                            c.userId.username
                                                    );
                                                }}
                                                className="cursor-pointer"
                                            >
                                                Trả lời
                                            </span>

                                            {/* Chỉ hiện khi là chủ comment */}
                                            {c.userId._id === user.id && (
                                                <MoreHorizontal className="w-4 h-4 cursor-pointer" />
                                            )}

                                            {/* Modal */}
                                            {showCommentLikesModal && (
                                                <LikesCommentModal
                                                    postId={c.postId}
                                                    commentId={c._id}
                                                    currentUserId={user.id}
                                                    onClose={() =>
                                                        setShowCommentLikesModal(
                                                            false
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Icon like */}
                                    <Heart
                                        className={`w-4 h-4 cursor-pointer mt-1 ${
                                            c.isLikedComment
                                                ? "fill-current text-red-500"
                                                : "text-gray-500"
                                        }`}
                                        onClick={() => handleCommentLike(c._id)}
                                    />
                                </div>

                                {/* Reply */}
                                {c.replies?.map((reply) => (
                                    <div
                                        key={reply._id}
                                        className="ml-11 mt-2 border-l-[2px] border-gray-300 pl-4"
                                    >
                                        <p className="text-sm leading-snug">
                                            <span className="font-semibold">
                                                {reply.userId.fullName ||
                                                    reply.userId.username}
                                            </span>{" "}
                                            <span>{reply.content}</span>
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                            <span>
                                                {formatPostTime(
                                                    reply.createdAt
                                                )}
                                            </span>
                                            <span
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setReplyTo(reply._id);
                                                    setReplyToUser(
                                                        reply.userId.fullName ||
                                                            reply.userId
                                                                .username
                                                    );
                                                }}
                                            >
                                                Trả lời
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <motion.div
                            onClick={handleLike}
                            initial={false}
                            animate={{
                                scale: postDetails.post.isLiked
                                    ? [1, 1.4, 1]
                                    : 1,
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center space-x-1 cursor-pointer"
                        >
                            <Heart
                                className={`${
                                    postDetails.post.isLiked
                                        ? "fill-current text-red-500"
                                        : ""
                                }`}
                            />
                            <span>{postDetails.likesCount}</span>
                        </motion.div>
                        <button className="flex items-center space-x-1">
                            <MessageCircle className="text-white" />
                            <span>{postDetails.commentsCount}</span>
                        </button>
                        <Send className="mr-2" />
                    </div>
                    {replyToUser && (
                        <div className="text-sm text-blue-400 mb-1 flex items-center justify-between">
                            Đang trả lời{" "}
                            <span className="font-semibold ml-1">
                                {replyToUser}
                            </span>
                            <button
                                className="ml-2 text-xs text-gray-400 hover:text-white"
                                onClick={() => {
                                    setReplyTo(null);
                                    setReplyToUser(null);
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    )}
                    {/* Input placeholder */}
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="text"
                            placeholder="Bình luận..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="flex-1 text-white text-sm outline-none"
                        />
                        {comment && (
                            <button
                                className="text-blue-500 text-sm font-medium"
                                onClick={handleAddComment}
                            >
                                Đăng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return isModal ? (
        <div
            className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center"
            onClick={handleClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full flex justify-center items-center 
                    ${hasMedia ? "max-w-5xl" : "max-w-md"}
                `}
            >
                {modalContent}
            </div>
        </div>
    ) : (
        <div className="min-h-screen bg-black text-white flex justify-center items-start">
            <div className="w-full max-w-5xl flex flex-col md:flex-row">
                {modalContent}
            </div>
        </div>
    );
}
