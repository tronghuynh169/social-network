import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPostDetails } from "~/api/post";
import { Heart, MessageCircle, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostDetailPage({ isModal = false }) {
    const { id: postId } = useParams();
    const navigate = useNavigate();
    const [postDetails, setPostDetails] = useState(null);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const handleSlideChange = (swiper) => {
        setAtStart(swiper.isBeginning);
        setAtEnd(swiper.isEnd);
    };

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const response = await getPostDetails(postId);
                setPostDetails(response.data);
            } catch (error) {
                console.error("Error fetching post details:", error);
            }
        };

        fetchPostDetails();
    }, [postId]);
    console.log(postDetails);
    const handleClose = () => {
        navigate(-1);
    };

    if (!postDetails) {
        return <div className="text-white p-4">Loading...</div>;
    }

    const modalContent = (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-[#121212] rounded-lg h-[90vh] w-full max-w-5xl flex flex-col md:flex-row overflow-hidden"
        >
            {/* Left: Media */}
            {/* Media */}
            {postDetails.post.media?.length > 0 && (
            <div className="w-md rounded-xl relative">
                <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                grabCursor
                spaceBetween={10}
                slidesPerView={1}
                className="rounded-xl"
                onSwiper={setSwiperInstance}
                onSlideChange={handleSlideChange}
                >
                {postDetails.post.media.map((media, index) => (
                    <SwiperSlide key={media._id || index}>
                    {media.type === 'image' ? (
                        <img
                        src={`http://localhost:5000${media.url}`}
                        alt={`Post media ${index}`}
                        className="w-full max-h-[500px] object-cover rounded-xl"
                        />
                    ) : media.type === 'video' ? (
                        <video
                        controls
                        className="w-full max-h-[500px] object-contain rounded-xl"
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
            <div className="w-full md:w-1/2 flex flex-col justify-between p-4 overflow-y-auto">
                {/* Close button */}
                <div className="flex justify-end mb-2">
                    <button
                        className="text-gray-400 hover:text-white text-sm"
                        onClick={handleClose}
                    >
                        <ChevronLeft /> Đóng
                    </button>
                </div>

                {/* Caption + Info */}
                <div className="flex items-center mb-4">
                    <img
                        src={postDetails.user?.avatar || "/default-avatar.png"}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm font-semibold">{postDetails.user?.username || "Người dùng"}</span>
                </div>

                <div className="text-sm mb-4">{postDetails.post.caption}</div>

                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <button className="flex items-center space-x-1">
                        <Heart className="text-white" />
                        <span>{postDetails.likesCount}</span>
                    </button>
                    <button className="flex items-center space-x-1">
                        <MessageCircle className="text-white" />
                        <span>{postDetails.commentsCount}</span>
                    </button>
                </div>

                <div className="text-sm space-y-2 max-h-60 overflow-y-auto pr-2">
                    {postDetails.comments.map((comment, index) => (
                        <div key={index} className="flex space-x-2">
                            <span className="font-semibold text-gray-300">{comment.user}</span>
                            <span className="text-white">{comment.content}</span>
                        </div>
                    ))}
                </div>

                {/* Input placeholder */}
                <div className="pt-4 border-t border-gray-700 mt-4">
                    <input
                        type="text"
                        className="w-full bg-transparent border-none text-white placeholder-gray-400 outline-none"
                        placeholder="Thêm bình luận..."
                        disabled
                    />
                </div>

                {/* Send button */}
                <div className="mt-4 text-right">
                    <button className="text-white text-sm flex items-center justify-center">
                        <Send className="mr-2" />
                        Gửi
                    </button>
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
            >
                {modalContent}
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
