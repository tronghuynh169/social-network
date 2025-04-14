import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPostDetails, toggleLike, addComment} from "~/api/post";
import { Heart, MessageCircle, Send, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileByUserId } from "~/api/profile";
import {formatPostTime} from "~/components/utils/formatPostTime";
import { useUser } from "~/context/UserContext";

export default function PostDetailPage({ isModal = false }) {
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

    const handleSlideChange = (swiper) => {
        setAtStart(swiper.isBeginning);
        setAtEnd(swiper.isEnd);
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        try {
          const newComment = await addComment(postDetails.post._id, comment);
          
          // Lấy fullName
          const profile = await getProfileByUserId(user.id);
      
          const fullComment = {
            ...newComment,
            content: comment,
            userId: {
              _id: user.id,
              username: user.username,
              fullName: profile.fullName, // thêm fullName
              avatar: profile.avatar,
            },
            createdAt: new Date().toISOString(), // Gán thời gian hiện tại cho createdAt
          };
      
          setComments((prev) => [...prev, fullComment]);
          setPostDetails(prev => ({
            ...prev,
            comments: [...prev.comments, fullComment]
          }));
          setComment("");
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
    
                // Lấy fullName cho mỗi comment
                const updatedComments = await Promise.all(
                    comments.map(async (comment) => {
                        if (!comment.userId?.fullName) {
                            try {
                                const profile = await getProfileByUserId(comment.userId._id);
                                return {
                                    ...comment,
                                    userId: {
                                        ...comment.userId,
                                        fullName: profile.fullName,
                                        avatar: profile.avatar
                                    },
                                };
                            } catch (err) {
                                console.error("Lỗi khi lấy profile comment:", err);
                                return comment;
                            }
                        }
                        return comment;
                    })
                );
    
                setPostDetails({
                    ...response.data,
                    comments: updatedComments,
                });
            } catch (error) {
                console.error("Error fetching post details:", error);
            }
        };
    
        fetchPostDetails();
    }, [postId]);

    useEffect(() => {
        const fetchInfo = async () => {
          if (!postDetails?.post?.userId?._id) return;
          try {
            const res = await getProfileByUserId(postDetails.post.userId._id);
            setInfo(res);
          } catch (err) {
            console.error('Lỗi khi load bài viết:', err);
          }
        };
        fetchInfo();
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

    const hasMedia = postDetails.post.media?.length > 0;
    const isSingleVideo = postDetails.post.media?.length === 1 && postDetails.post.media[0].type === 'video';


    const modalContent = (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={`bg-[var(--secondary-color)] h-[90vh] w-full overflow-hidden flex
                ${hasMedia ? "max-w-5xl flex-col md:flex-row" : "max-w-[500px] flex-col"}
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
                    {media.type === 'image' ? (
                        <img
                        src={`http://localhost:5000${media.url}`}
                        alt={`Post media ${index}`}
                        className="w-full h-[90vh] object-cover"
                        />
                    ) : media.type === 'video' ? (
                        <video
                        controls
                        className="max-w-full max-h-[90vh] object-contain"
                        >
                        <source src={`http://localhost:5000${media.url}`} type="video/mp4" />
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
            <div className={`w-full ${hasMedia ? "md:w-1/2" : "md:w-full"} max-w-[500px] min-h-[90vh] flex flex-col p-4 overflow-y-auto`}>
                {/* Caption + Info */}
                <div className="border-b-2 pb-2 border-[var(--border-color)]">
                    <div className="flex items-center space-x-3">
                        <img
                        src={info?.avatar || "/default-avatar.png"}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-semibold text-sm">{info?.fullName}</p>
                            <p className="text-xs text-gray-400">
                                {formatPostTime(postDetails.post.createdAt)}
                            </p>
                        </div>
                    </div>
    
                    {/* Caption */}
                    <div className="text-sm mt-4">
                        {postDetails.post.caption?.length > 100 ? (
                        <>
                            {showFullCaption ? postDetails.post.caption : `${postDetails.post.caption.slice(0, 100)}...`}
                            <button
                            onClick={() => setShowFullCaption(!showFullCaption)}
                            className="text-gray-400 ml-2 cursor-pointer hover:underline"
                            >
                            {showFullCaption ? 'thu gọn' : 'xem thêm'}
                            </button>
                        </>
                        ) : (
                        <>{postDetails.post.caption}</>
                        )}
                    </div>
                </div>


                <div className="text-sm space-y-6 max-h-full overflow-y-auto pr-2 py-2 no-scrollbar">
                {postDetails.comments
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sắp xếp theo createdAt
                    .map((c, idx) => (
                        <div
                            key={c._id || idx}
                            className="grid grid-cols-[auto_1fr_auto] gap-3 items-center w-full"
                        >
                            {/* Avatar */}
                            <img
                                src={c.userId?.avatar || "/default-avatar.png"}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full"
                            />

                            {/* Nội dung */}
                            <div className="break-words break-all whitespace-pre-wrap leading-snug">
                                <span className="font-semibold whitespace-nowrap">
                                    {c.userId.fullName || c.userId.username}
                                </span>
                                <span className="ml-1">{c.content}</span>

                                <p className="text-xs text-gray-400">
                                    {formatPostTime(c.createdAt)}
                                </p>
                            </div>

                            {/* Icon */}
                            <Heart className="w-4 h-4 text-gray-500" />
                        </div>
                    ))}
            </div>
                
                <div className="mt-auto pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <button className="flex items-center space-x-1">
                            <Heart className="text-white" />
                            <span>{postDetails.likesCount}</span>
                        </button>
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
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 text-white text-sm outline-none"
                        />
                        {comment && <button
                        className="text-blue-500 text-sm font-medium"
                        onClick={handleAddComment}
                        >
                        Đăng
                        </button>}
                    </div>

                </div>

            </div>
        </motion.div>
    );

    return isModal ? (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center"
                onClick={handleClose}
            >
                <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl flex justify-center items-center">
                    {modalContent}
                </div>
            </motion.div>
        </AnimatePresence>
    ) : (
        <div className="min-h-screen bg-black text-white flex justify-center items-start">
            <div className="w-full max-w-5xl flex flex-col md:flex-row">
                {modalContent}
            </div>
        </div>
    );
}
