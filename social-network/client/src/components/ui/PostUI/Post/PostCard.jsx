import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { getProfileByUserId } from "~/api/profile";
import {
  toggleLike,
  addComment,
  getPostDetails
} from "~/api/post";
import {formatPostTime} from "~/components/utils/formatPostTime";
import { motion } from 'framer-motion';
import LikesModal from "./LikesModal";
import { useUser } from "~/context/UserContext";

export default function PostCard({ post }) {
    const navigate = useNavigate(); 
    const { user } = useUser();
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [liked, setLiked] = useState(post.isLiked || false);
    const [likeAnimationTrigger, setLikeAnimationTrigger] = useState(false);
    const [info, setInfo] = useState();
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [comment, setComment] = useState("");
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [comments, setComments] = useState([]);

    const handleLike = async () => {
      try {
        const res = await toggleLike(post._id);
        setLiked(res.isLiked);
        
        // Trigger animation
        setLikeAnimationTrigger(true);
        setTimeout(() => setLikeAnimationTrigger(false), 300); // Reset sau khi xong
        setLikesCount(res.likesCount);
      } catch (err) {
        console.error("Lỗi khi like:", err);
      }
    };

    const handleAddComment = async () => {
      if (!comment.trim()) return;
      try {
        const newComment = await addComment(post._id, comment);
        
        // Lấy fullName
        const profile = await getProfileByUserId(user.id);
    
        const fullComment = {
          ...newComment,
          content: comment,
          userId: {
            _id: user.id,
            username: user.username,
            fullName: profile.fullName, // thêm fullName
          },
        };
    
        setComments((prev) => [...prev, fullComment]);
        setComment("");
      } catch (err) {
        console.error("Lỗi khi bình luận:", err);
      }
    };

    const handleCommentClick = () => {
      navigate(`/post/${post._id}`, {
        state: {
          backgroundLocation: location.pathname,
        },
      });
    };


    const handleSlideChange = (swiper) => {
        setAtStart(swiper.isBeginning);
        setAtEnd(swiper.isEnd);
    };

    useEffect(() => {
        const fetchInfo = async () => {
          try {
            const res = await getProfileByUserId(post.userId._id);
            setInfo(res);
          } catch (err) {
            console.error('Lỗi khi load bài viết:', err);
          }
        };
        fetchInfo();
      }, []);

      useEffect(() => {
        const fetchPost = async () => {
          try {
            const res = await getPostDetails(post._id);
            const rawComments = res.data.comments;
      
            // Map qua từng comment và thêm fullName từ profile
            const commentsWithFullName = await Promise.all(
              rawComments.map(async (c) => {
                try {
                  const profile = await getProfileByUserId(c.userId._id);
                  return {
                    ...c,
                    userId: {
                      ...c.userId,
                      fullName: profile.fullName, // thêm fullName
                    }
                  };
                } catch (err) {
                  console.error("Lỗi khi lấy fullName:", err);
                  return c;
                }
              })
            );
      
            setComments(commentsWithFullName);
          } catch (err) {
            console.error("Lỗi khi tải comment:", err);
          }
        };
      
        fetchPost();
      }, []);
      

  return (
    <div className="max-w-md mx-auto bg-black text-[var(--text-primary-color)] border-b border-[var(--border-color)] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <img
          src={info?.avatar || "/default-avatar.png"}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-sm">{info?.fullName}</p>
          <p className="text-xs text-gray-400">
            {formatPostTime(post.createdAt)}
        </p>
        </div>
      </div>

      {/* Media */}
      {post.media?.length > 0 && (
      <div className="w-full rounded-xl relative">
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
          {post.media.map((media, index) => (
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

        {post.media.length > 1 && !atStart && (
          <button
            onClick={() => swiperInstance.slidePrev()}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {post.media.length > 1 && !atEnd && (
          <button
            onClick={() => swiperInstance.slideNext()}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
        <motion.div
          onClick={handleLike}
          initial={false}
          animate={likeAnimationTrigger ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-6 h-6 cursor-pointer hover:opacity-70"
        >
          <Heart className={`w-6 h-6 ${liked ? "fill-current text-red-500" : ""}`} />
        </motion.div>
          <MessageCircle className="w-6 h-6 hover:opacity-70 cursor-pointer" onClick={handleCommentClick}/>
        </div>
          <Send className="w-6 h-6 hover:opacity-70 cursor-pointer" />
      </div>

      {/* Likes */}
      <p
        className="text-sm font-semibold cursor-pointer hover:underline"
        onClick={() => setShowLikesModal(true)}
      >
        {likesCount} lượt thích
      </p>

      {showLikesModal && (
        <LikesModal
          postId={post._id}
          currentUserId={user.id}
          onClose={() => setShowLikesModal(false)}
        />
      )}

      {/* Caption */}
      <div className="text-sm">
        <span className="font-semibold">{post.user?.username} </span>
        {post.caption?.length > 100 ? (
          <>
            {showFullCaption ? post.caption : `${post.caption.slice(0, 100)}...`}
            <button
              onClick={() => setShowFullCaption(!showFullCaption)}
              className="text-gray-400 ml-2 cursor-pointer hover:underline"
            >
              {showFullCaption ? 'thu gọn' : 'xem thêm'}
            </button>
          </>
        ) : (
          <>{post.caption}</>
        )}
      </div>
      {/* Bình luận */}
      {comments.length > 0 && (
        <div className="text-sm space-y-1">
          <button className="text-gray-400 text-sm hover:underline">
            Xem tất cả {comments.length} bình luận
          </button>

          {comments
              .filter((c) => c.userId._id === user.id) // Chỉ của bạn
              .map((c, idx) => (
                <div key={c._id || idx} className="flex justify-between items-center w-full">
                  {/* Trái: fullName + 2 khoảng trắng + content */}
                  <div className="flex items-center max-w-[90%] overflow-hidden">
                    <span className="font-semibold whitespace-nowrap">
                      {c.userId.fullName || c.userId.username}
                    </span>
                    <span className="truncate ml-2">
                      {c.content}
                    </span>
                  </div>

                  {/* Phải: icon */}
                  <Heart className="w-4 h-4 shrink-0 ml-2" />
                </div>
            ))}
        </div>
      )}
      <div className="flex items-center space-x-2 pt-2">
        <input
          type="text"
          placeholder="Bình luận..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 bg-black text-white text-sm outline-none"
        />
        {comment && <button
          className="text-blue-500 text-sm font-medium"
          onClick={handleAddComment}
        >
          Đăng
        </button>}
      </div>
    </div>
  );
}
