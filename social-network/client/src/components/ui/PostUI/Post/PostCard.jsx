import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { getProfileByUserId } from "~/api/profile"
import {
  toggleLike,
  addComment,
} from "~/api/post";
import {formatPostTime} from "~/components/utils/formatPostTime"

export default function PostCard({ post }) {
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [liked, setLiked] = useState(post.isLiked || false);
    const [info, setInfo] = useState();
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [comment, setComment] = useState("");
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const handleLike = async () => {
        try {
        await toggleLike(post._id);
        setLiked(!liked);
        setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
        } catch (err) {
        console.error("Lỗi khi like:", err);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        try {
        await addComment(post._id, comment);
        setComment("");
        } catch (err) {
        console.error("Lỗi khi bình luận:", err);
        }
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
            console.log(res)
          } catch (err) {
            console.error('Lỗi khi load bài viết:', err);
          }
        };
        fetchInfo();
      }, []);


  return (
    <div className="max-w-md mx-auto bg-black text-[var(--text-primary-color)] border border-gray-700 rounded-xl p-4 space-y-4">
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
          {post.media?.map((media, index) => (
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

        {/* Custom Arrows */}
        {!atStart && (
          <button
            onClick={() => swiperInstance.slidePrev()}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {!atEnd && (
          <button
            onClick={() => swiperInstance.slideNext()}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Heart
            className={`w-6 h-6 cursor-pointer ${liked ? "text-red-500" : ""}`}
            onClick={handleLike}
          />
          <MessageCircle className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
          <Send className="w-6 h-6 hover:text-green-400 cursor-pointer" />
        </div>
        <Bookmark className="w-6 h-6 hover:text-yellow-400 cursor-pointer" />
      </div>

      {/* Likes */}
      <p className="text-sm font-semibold">{likesCount} lượt thích</p>

      {/* Caption */}
      <div className="text-sm">
        <span className="font-semibold">{post.user?.username} </span>
        {showFullCaption ? (
          <>{post.caption}</>
        ) : (
          <>
            {post.caption?.slice(0, 100)}...
            <button
              onClick={() => setShowFullCaption(true)}
              className="text-gray-400 ml-2"
            >
              xem thêm
            </button>
          </>
        )}
      </div>

      {/* Bình luận */}
      <div className="flex items-center space-x-2 border-t border-gray-700 pt-2">
        <input
          type="text"
          placeholder="Bình luận..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 bg-black text-white text-sm outline-none"
        />
        <button
          className="text-blue-500 text-sm font-medium"
          onClick={handleAddComment}
        >
          Đăng
        </button>
      </div>
    </div>
  );
}
