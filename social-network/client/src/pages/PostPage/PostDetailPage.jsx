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
import CommentItem from "~/components/ui/PostUI/Post/CommentItem";

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
    const [displayComment, setDisplayComment] = useState(""); // Chỉ hiện @Tên
    

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

            // Hàm đệ quy để cập nhật comment hoặc reply theo ID
            const updateCommentTree = (comments) => {
                return comments.map((comment) => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            isLikedComment,
                            likesCommentCount,
                        };
                    }

                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateCommentTree(comment.replies),
                        };
                    }

                    return comment;
                });
            };

            // Cập nhật state
            setPostDetails((prev) => ({
                ...prev,
                comments: updateCommentTree(prev.comments),
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
                newComment = await addReply(
                    postDetails.post._id,
                    replyTo,
                    comment
                );
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

            // Cập nhật lại state với reply được thêm vào
            setPostDetails((prev) => {
                const updatedComments = replyTo
                    ? prev.comments.map((comment) =>
                          comment._id === replyTo
                              ? {
                                    ...comment,
                                    replies: [
                                        ...(comment.replies || []),
                                        fullComment,
                                    ],
                                }
                              : comment
                      )
                    : [...prev.comments, { ...fullComment, replies: [] }];

                return { ...prev, comments: updatedComments };
            });

            // Gọi lại API để fetch lại dữ liệu mới nhất từ server
            fetchPostDetails();

            setComment("");
            setDisplayComment("");
            setReplyTo(null);
            setReplyToUser(null);
        } catch (err) {
            console.error("Lỗi khi bình luận:", err);
        }
    };

    const fetchPostDetails = async () => {
        try {
            const response = await getPostDetails(postId);
            const post = response.data.post;
            const comments = response.data.comments || [];
            console.log(response.data);

            setPostDetails(response.data); // giữ nguyên dữ liệu backend trả về
        } catch (error) {
            console.error("Error fetching post details:", error);
        }
    };

    useEffect(() => {
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
                <div className="text-sm space-y-4 max-h-full overflow-y-auto pr-2 py-4 no-scrollbar">
                    {postDetails.comments
                        .filter((c) => !c.replyTo) // Lọc các comment gốc
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .map((c) => (
                            <CommentItem
                                key={`${c._id}-${c.createdAt}`}
                                comment={c}
                                user={user}
                                onReply={(id, name) => {
                                    setReplyTo(id);
                                    setReplyToUser(name);
                                    setComment(`@{${id}}|${name}  `);
                                    setDisplayComment(`@${name} `);
                                }}
                                onLike={handleCommentLike}
                                showLikesModal={showCommentLikesModal}
                                setShowLikesModal={setShowCommentLikesModal}
                            />
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
                    
                    {/* Input placeholder */}
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="text"
                            placeholder="Bình luận..."
                            value={displayComment}
                            onChange={(e) => {
                                const newDisplayValue = e.target.value;
                                setDisplayComment(newDisplayValue);
                                
                                // Nếu đang reply và text bắt đầu bằng @Tên
                                if (replyTo && newDisplayValue.startsWith(`@${replyToUser}`)) {
                                  setComment(`@{${replyTo}}|${replyToUser} ${newDisplayValue.slice(replyToUser.length + 1)}`);
                                } else {
                                  setComment(newDisplayValue);
                                }
                              }}
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
