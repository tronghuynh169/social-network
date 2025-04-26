import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Send, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { getProfileByUserId } from "~/api/profile";
import {
  toggleLike,
  addComment,
  getPostDetails,
  deletePost,
  toggleCommentLike 
} from "~/api/post";
import {formatPostTime} from "~/components/utils/formatPostTime";
import { motion } from 'framer-motion';
import LikesModal from "./LikesModal";
import { useUser } from "~/context/UserContext";
import { usePosts } from "~/context/PostContext";
import PostOptionsModal from "~/components/ui/PostUI/Post/PostOptionsModal";
import ConfirmDeleteModal from "~/components/ui/PostUI/Post/ConfirmDeleteModal";
import PostModal from "~/components/ui/PostUI/PostUpLoadUI/PostModal";
import CommentItem from "~/components/ui/PostUI/Post/CommentItem";

export default function PostCard({ post }) {
    const navigate = useNavigate(); 
    const { posts, updatePostLike, setPosts, updatePostData } = usePosts();  
    const postFromContext = posts.find(p => p._id === post._id); // Tìm bài viết trong context
    const { user } = useUser();
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [liked, setLiked] = useState(post.isLiked || false);
    const [likeAnimationTrigger, setLikeAnimationTrigger] = useState(false);
    const [info, setInfo] = useState();
    const [likesCount, setLikesCount] = useState(postFromContext?.likesCount || 0);
    const [comment, setComment] = useState("");
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [comments, setComments] = useState(postFromContext?.comments || []);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPostData, setEditPostData] = useState(null);

    const handleLike = async () => {
      try {
        const res = await toggleLike(post._id);
        
        // Cập nhật state local
        setLiked(res.isLiked);
        setLikesCount(res.likesCount);

        // Cập nhật vào context
        updatePostLike(post._id, res.isLiked, res.likesCount);
        
        // Trigger animation
        setLikeAnimationTrigger(true);
        setTimeout(() => setLikeAnimationTrigger(false), 300);
      } catch (err) {
        console.error("Lỗi khi like:", err);
      }
    };

    const handleCommentLike = async (commentId) => {
      try {
        const res = await toggleCommentLike(post._id, commentId);
        const { isLikedComment, likesCommentCount } = res.data;
    
        // Hàm đệ quy cập nhật comment/reply
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
    
        const updatedComments = updateCommentTree(comments);
        setComments(updatedComments); // ✅ chỉ set local thôi
    
      } catch (err) {
        console.error("Lỗi khi like comment:", err);
      }
    };
  

    const handleDelete = () => {
      setShowOptionModal(false);
      setShowConfirmDeleteModal(true); // mở modal xác nhận
  };

  const confirmDelete = async () => {
    try {
        const postIdToDelete = post._id;
        await deletePost(postIdToDelete);
        setShowConfirmDeleteModal(false);
        setPosts(prev => prev.filter(p => p._id !== postIdToDelete));
        navigate('/');
        console.log("Đã xóa bài viết");
    } catch (err) {
        console.error("Lỗi xoá bài viết:", err);
    }
};
  
  const handleEdit = () => {
      setEditPostData(post); // post là bài viết đang hiển thị trong PostDetailPage
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

    useEffect(() => {
      if (postFromContext?.comments) {
        setComments(postFromContext.comments);
      }
    }, [postFromContext?.comments]);

    useEffect(() => {
      if (postFromContext) {
        setLiked(postFromContext.isLiked);  // Cập nhật lại trạng thái liked nếu context thay đổi
        setLikesCount(postFromContext.likesCount);  // Cập nhật lại số lượng likes nếu context thay đổi
      }
    }, [postFromContext]);  // Chạy lại khi context thay đổi

    const handleAddComment = async () => {
      if (!comment.trim()) return;
      try {
        const newComment = await addComment(post._id, comment);
        console.log(newComment.data);
        // Lấy fullName
        const profile = await getProfileByUserId(user.id);
    
        const fullComment = {
          ...newComment.data,
          content: comment,
          userId: {
            _id: user.id,
            username: user.username,
            fullName: profile.fullName, // thêm fullName
            avatar: profile.avatar
          },
          isLikedComment: false, // 💥 Thêm mặc định
          likesCommentCount: 0,   // 💥 Thêm mặc định
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
          if (post?.userId) {
            const userId = typeof post.userId === 'string' ? post.userId : post.userId._id;
            const res = await getProfileByUserId(userId);
            setInfo(res);
          } else {
            console.log("Không có userId hợp lệ.");
          }
        } catch (err) {
          console.error('Lỗi khi load bài viết:', err);
        }
      };
      fetchInfo();
    }, [post]); // Thêm post vào danh sách phụ thuộc

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

      const isOwner = user && post?.userId._id === user.id;

  return (
    <div className="max-w-md mx-auto bg-black text-[var(--text-primary-color)] border-b border-[var(--border-color)] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between space-x-3">
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
        {showConfirmDeleteModal && (
        <ConfirmDeleteModal
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmDeleteModal(false)}
        />
        )}
        {showEditModal && (
            <PostModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                mode="edit"
                initialPostData={editPostData}
                onUpdate={async (updatedPost) => {
                  try { 
                    // Gọi API để lấy dữ liệu mới nhất từ server
                    console.log("updatedPost:",updatedPost);
                    const { data: refreshedPost } = await getPostDetails(updatedPost.post._id);
                    
                    // Cập nhật state posts với dữ liệu mới
                    setPosts(prevPosts => 
                      prevPosts.map(p => 
                        p._id === refreshedPost._id ? refreshedPost : p
                      )
                    );
                  } catch (err) {
                    console.error("Lỗi khi làm mới bài viết:", err);
                  }
                }}
            />
        )}
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
      {
        (likesCount > 0) &&
      <p
        className="text-sm font-semibold cursor-pointer hover:underline"
        onClick={() => setShowLikesModal(true)}
      >
        {likesCount} lượt thích
      </p>
      }

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
          <button className="text-gray-400 text-sm hover:underline cursor-pointer mb-4" onClick={handleCommentClick}>
            Xem tất cả {comments.reduce((acc, comment) => {
              return acc + 1 + countRepliesRecursive(comment.replies || []);
            }, 0
            )} bình luận
          </button>
        

          {comments
            .filter((c) => c.userId._id === user.id)
            .reverse()
            .slice(0, 3)
            .map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                user={user}
                onReply={(commentId, username) => {
                  console.log("Reply to", commentId, username);
                }}
                onLike={handleCommentLike}
                onDelete={(commentId) => {
                  console.log("Delete comment", commentId);
                }}
              />
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

const countRepliesRecursive = (replies) => {
  if (!replies || replies.length === 0) return 0;

  return replies.reduce((acc, reply) => {
    return acc + 1 + countRepliesRecursive(reply.replies || []);
  }, 0);
};
