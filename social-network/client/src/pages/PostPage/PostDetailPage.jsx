import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
    getPostDetails,
    toggleLike,
    addComment,
    addReply,
    toggleCommentLike,
    deleteComment,
    deletePost,
    updatePost
} from "~/api/post";
import {
    Heart,
    MessageCircle,
    Send,
    ChevronLeft,
    ChevronRight,
    X,
    MoreHorizontal,
    Loader2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getProfileByUserId } from "~/api/profile";
import { formatPostTime } from "~/components/utils/formatPostTime";
import { useUser } from "~/context/UserContext";
import { motion } from "framer-motion";
import PostOptionsModal from "~/components/ui/PostUI/Post/PostOptionsModal";
import ConfirmDeleteModal from "~/components/ui/PostUI/Post/ConfirmDeleteModal";
import CommentItem from "~/components/ui/PostUI/Post/CommentItem";
import { usePosts } from '~/context/PostContext';
import PostModal from "~/components/ui/PostUI/PostUpLoadUI/PostModal";
import LikesModal from "~/components/ui/PostUI/Post/LikesModal";

export default function PostDetailPage({ isModal = false }) {
    const { updatePostLike, setPosts, posts } = usePosts(); // trong PostDetailPage
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
    const [isCommenting, setIsCommenting] = useState(false);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPostData, setEditPostData] = useState(null);
    const [likeAnimationTrigger, setLikeAnimationTrigger] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const commentInputRef = useRef(null);

    const handleDelete = () => {
        setShowOptionModal(false);
        setShowConfirmDeleteModal(true); // mở modal xác nhận
    };

    const confirmDelete = async () => {
        try {
            await deletePost(postDetails.post._id); // hoặc postId nếu có sẵn
            setShowConfirmDeleteModal(false);
            setPosts(prev => prev.filter(post => post._id !== postId));
            navigate('/');
            console.log("Đã xóa bài viết");
        } catch (err) {
            console.error("Lỗi xoá bài viết:", err);
        }
    };
    
    const handleEdit = () => {
        setEditPostData(postDetails.post); // post là bài viết đang hiển thị trong PostDetailPage
        setShowOptionModal(false); // đóng menu tuỳ chọn
        setShowEditModal(true);    // mở modal chỉnh sửa
    };

    
    
      const handleGoToPost = () => {
        window.location.href = `/post/${post._id}`;
      };
    
      const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
        alert('📋 Đã sao chép liên kết!');
      };

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

                // Trigger animation
            setLikeAnimationTrigger(true);
            setTimeout(() => setLikeAnimationTrigger(false), 300);
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
        setIsCommenting(true);
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
            await fetchPostDetails();

            setComment("");
            setDisplayComment("");
            setReplyTo(null);
            setReplyToUser(null);
        } catch (err) {
            console.error("Lỗi khi bình luận:", err);
        }
        finally {
            setIsCommenting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(postDetails.post._id, commentId);
            await fetchPostDetails();
            }
         catch (err) {
            console.error("Lỗi xóa comment:", err);
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

    // Tính isOwner sau khi đã có postDetails
    const isOwner = user && postDetails?.post?.userId._id === user.id;
    const hasMedia = postDetails?.post?.media?.length > 0;
    const isSingleVideo =
        postDetails.post.media?.length === 1 &&
        postDetails.post.media[0].type === "video";

    const modalContent = (
        <div
            className={`bg-[var(--primary-color)] h-[90vh] w-full overflow-hidden flex
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
                    <div className="flex items-center justify-between">
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
                        <MoreHorizontal
                            className="w-4 h-4 cursor-pointer"
                            onClick={() => setShowOptionModal(true)}
                        />
                        {showOptionModal && (
                            <PostOptionsModal
                            isOwner={isOwner}
                            onClose={() => setShowOptionModal(false)}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onGoToPost={handleGoToPost}
                            onCopyLink={handleCopyLink}
                            />
                        )}
                        {showEditModal && (
                            <PostModal
                                isOpen={showEditModal}
                                onClose={() => setShowEditModal(false)}
                                mode="edit"
                                initialPostData={editPostData}
                                onUpdate={(updatedPost) => setPostDetails(updatedPost)}
                            />
                        )}
                        {showConfirmDeleteModal && (
                        <ConfirmDeleteModal
                            onConfirm={confirmDelete}
                            onCancel={() => setShowConfirmDeleteModal(false)}
                        />
                        )}
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
                                onDelete={handleDeleteComment} // Truyền hàm xóa vào đây
                                showLikesModal={showCommentLikesModal}
                                setShowLikesModal={setShowCommentLikesModal}
                            />
                        ))}
                </div>
                
                <div className="mt-auto pt-4 border-t-2 border-[var(--border-color)]">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        <motion.div
                            onClick={handleLike}
                            initial={false}
                            animate={likeAnimationTrigger ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center space-x-1 cursor-pointer hover:opacity-70"
                        >
                            <Heart
                                className={`${
                                    postDetails.post.isLiked
                                        ? "fill-current text-red-500"
                                        : "text-white"
                                }`}
                            />
                        </motion.div>
                        <button className="flex items-center space-x-1 cursor-pointer hover:opacity-70"
                                onClick={() => commentInputRef.current?.focus()}
                        >
                            <MessageCircle className="text-white" />
                        </button>
                        <Send className="mr-2" />
                    </div>
                    {/* Likes */}
                    <div className="mb-2">
                        {
                            (postDetails.likesCount > 0) ?
                        <p
                            className="text-sm font-semibold cursor-pointer hover:underline"
                            onClick={() => setShowLikesModal(true)}
                        >
                            {postDetails.likesCount} lượt thích
                        </p> : <p className="text-sm font-semibold">Hãy là người đầu tiên thích bài viết này</p>
                        }
                    </div>
                    {showLikesModal && (
                        <LikesModal
                        postId={postDetails.post._id}
                        currentUserId={user.id}
                        onClose={() => setShowLikesModal(false)}
                        />
                    )}
                    
                    {/* Input placeholder */}
                    <div className="flex items-center space-x-2 pt-3">
                        <input
                            type="text"
                            ref={commentInputRef}
                            placeholder="Bình luận..."
                            disabled={isCommenting}
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
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !isCommenting && displayComment.trim()) {
                                    e.preventDefault(); // tránh submit form nếu có
                                    handleAddComment();
                                }
                            }}
                            className="flex-1 text-white text-sm outline-none"
                        />
                        {
                            isCommenting ? (
                                <Loader2 className="animate-spin text-gray-400 w-4 h-4" />
                              ) : 
                             ( 
                                displayComment &&
                                <button
                                    className="text-[var(--text-enable-color)] text-sm font-medium cursor-pointer hover:text-[#c8d7e4]"
                                    onClick={handleAddComment}
                                >
                                    Đăng
                                </button>
                             
                            )
                        }
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
