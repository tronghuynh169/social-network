import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Send, ChevronLeft, ChevronRight, MoreHorizontal, Loader2  } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { getProfileByUserId, getFollowing, getProfileById  } from "~/api/profile";
import {
  toggleLike,
  addComment,
  getPostDetails,
  deletePost,
  toggleCommentLike,
  deleteComment,
  addReply,
} from "~/api/post";
import {formatPostTime} from "~/components/utils/formatPostTime";
import { hover, motion } from 'framer-motion';
import LikesModal from "./LikesModal";
import { useUser } from "~/context/UserContext";
import { usePosts } from "~/context/PostContext";
import PostOptionsModal from "~/components/ui/PostUI/Post/PostOptionsModal";
import ConfirmDeleteModal from "~/components/ui/PostUI/Post/ConfirmDeleteModal";
import PostModal from "~/components/ui/PostUI/PostUpLoadUI/PostModal";
import CommentItem from "~/components/ui/PostUI/Post/CommentItem";
import CopyLinkModal from "~/components/ui/PostUI/Post/CopyLinkModal";
import UserHoverCard from "~/components/ui/UserHoverCard/UserHoverCard";
import ShareModal from "~/components/ui/PostUI/Share/ShareModal";


export default function PostCard({ post }) {
    const navigate = useNavigate(); 
    const location = useLocation();
    const { posts, updatePostLike, setPosts, updatePostData } = usePosts();  
    const postFromContext = posts.find(p => p._id === post._id); // Tìm bài viết trong context
    const postId = postFromContext._id;
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
    const [replyTo, setReplyTo] = useState(null);
    const [replyToUser, setReplyToUser] = useState(null);
    const [displayComment, setDisplayComment] = useState(""); // Chỉ hiện @Tên
    const [isCommenting, setIsCommenting] = useState(false);
    const [isCopyModalVisible, setCopyModalVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [hoverSource, setHoverSource] = useState(null); // 'avatar' or 'name'
    const [isOwner, setIsOwner] = useState(false);
    const [isOpenShareModal, setIsOpenShareModal] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(true);

    //mention states
    const [hasMentioned, setHasMentioned] = useState(false);
    const [mentionUsers, setMentionUsers] = useState({}); // {slug: userObject}

    // --- BEGIN AUTOCOMPLETE STATES ---
    const [followings, setFollowings] = useState([]);
    const [mentionSuggestions, setMentionSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    // NEW: index của item đang được chọn bằng phím
    const [activeIndex, setActiveIndex] = useState(-1);
    
    // 1. Ref cho wrapper chứa cả input + dropdown
    const wrapperRef = useRef(null);

    // 2. Dùng useEffect để lắng nghe click ngoài
    useEffect(() => {
      function handleClickOutside(event) {
        // Nếu click không nằm trong wrapperRef, ẩn dropdown
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setShowSuggestions(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, []);

    useEffect(() => {
      const fetchFollowings = async () => {
        try {
          const profile = await getProfileByUserId(user.id);
          const fullFollowings = await getFollowing(profile._id); 
          setFollowings(fullFollowings); // loại bỏ null nếu có lỗi
        } catch (err) {
          console.error("Lỗi khi lấy danh sách follow:", err);
        }
      };
    
      fetchFollowings();
    }, [user.id]);

    useEffect(() => {
        const saved = localStorage.getItem('mentionUsers');
        if (saved) {
            try {
            setMentionUsers(JSON.parse(saved));
            } catch (e) {
            console.error('Failed to parse mentionUsers from localStorage', e);
            localStorage.removeItem('mentionUsers');
            }
        }
        }, []);
    

    const handleSelectMention = (user) => {
        const mentionDisplay = `@${user.fullName}  `;
        const mentionMarkup  = `@{${user.slug}}|${user.fullName}  `;
        const newDisplay = displayComment.replace(/@[\p{L} ]*$/u, mentionDisplay);
        setDisplayComment(newDisplay);
        const newComment = comment.replace(/@(?:\{[^}]*\}\|)?[\p{L} ]*$/u, mentionMarkup);
        setComment(newComment);
        setMentionUsers(prev => {
            const updated = { ...prev, [user.slug]: user };
            // 2) lưu vào localStorage
            localStorage.setItem('mentionUsers', JSON.stringify(updated));
            return updated;
        }); 
        setShowSuggestions(false);
        setHasMentioned(true); // ✅ Đánh dấu đã mention
    };

    const handleNavigateToDetail = () => {
      navigate(`/post/${post._id}`, {
        state: {
          backgroundLocation: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
    };

    const fetchComment = async () => {
      try {
        const response = await getPostDetails(post._id);
        const comments = response.data.comments || [];
        setComments(comments); 
        return response.data; 
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };

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

    const handleDeleteComment = async (commentId) => {
      setComments(prev => prev.filter(c => c._id !== commentId));

      try {
        // 2. Gọi API xóa
        await deleteComment(post._id, commentId);
        await fetchComment();
      } catch (err) {
        console.error("Lỗi xóa comment:", err);
        setComments(postFromContext?.comments || []);
      }
  };

    const handleGoToPost = () => {
      navigate(`/post/${post._id}`, { replace: false });
    };

    const handleGoToProfile = () => {
      navigate(`/${info.slug}`, { replace: false });
    };
  
    const handleCopyLink = () => {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
      setShowOptionModal(false);
      setCopyModalVisible(true);

      // Ẩn modal sau 1.5 giây
      setTimeout(() => {
        setCopyModalVisible(false);
      }, 1500);
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

    function addReplyToCommentList(commentList, replyToId, newReply) {
      return commentList.map(comment => {
        if (comment._id === replyToId) {
          // Nếu tìm thấy comment cha
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          // Nếu có replies thì tìm sâu hơn
          return {
            ...comment,
            replies: addReplyToCommentList(comment.replies, replyToId, newReply)
          };
        }
        return comment;
      });
    }

    const handleAddComment = async () => {
      if (!comment.trim()) return;
      setIsCommenting(true);
    
      try {
        const resp = replyTo
          ? await addReply(post._id, replyTo, comment)
          : await addComment(post._id, comment);
    
        // Không tự chế comment ở client nữa ❌
    
        // Xong thì fetch lại bài viết để lấy đúng dữ liệu server
        await fetchComment();
    
        // Reset các input
        setComment("");
        setDisplayComment("");
        setReplyTo(null);
        setReplyToUser(null);
        setHasMentioned(false); // ✅ reset lại
      } catch (err) {
        console.error("Lỗi khi bình luận:", err);
      } finally {
        setIsCommenting(false);
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
          setIsLoadingComments(true); // Bắt đầu loading
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
          } finally {
            setIsLoadingComments(false); // Kết thúc loading
          }
        };
      
        fetchPost();
      }, []);

      useEffect(() => {
        if (user && post?.userId) {
          const userId = typeof post.userId === 'string' ? post.userId : post.userId._id;
          setIsOwner(String(userId) === String(user.id));
        }
      }, [user, post?.userId]);

  return (
    <div className="max-w-md mx-auto bg-black text-[var(--text-primary-color)] border-b border-[var(--border-color)] p-4 space-y-4">
      {/* Header */}
        <div className="flex items-center justify-between space-x-3">
          <div className="relative" onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => {
                                    setIsHovered(false);
                                    setHoverSource(null);
                                  }}>
            <div className="flex items-center space-x-3">
              <div onMouseEnter={() => {
                setHoverSource('avatar');
                setIsHovered(true);
              }}>
                <img
                  src={info?.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer hover:opacity-90"
                  onClick={handleGoToProfile}
                />
              </div>
    
              <div onMouseEnter={() => {
                  setHoverSource('name');
                  setIsHovered(true);
                }}>
                <p onClick={handleGoToProfile} 
                  className="font-semibold text-sm cursor-pointer">
                  {info?.fullName}
                </p>
                <p className="text-xs text-gray-400">
                  {formatPostTime(post.createdAt)}
              </p>
              </div>
              {/* Modal */}
              {isHovered && <UserHoverCard info={info} hoverPosition={hoverSource} />
              }
          </div>
        </div>
        <MoreHorizontal
            className="w-4 h-4 cursor-pointer"
            onClick={() => setShowOptionModal(true)}
        />
      </div>
      {showOptionModal && (
            <PostOptionsModal
            showGoToPostButton={true}
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
        {
          isCopyModalVisible &&
          <CopyLinkModal isVisible={isCopyModalVisible} onClose={() => setCopyModalVisible(false)} />
        }
        
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
          <Send className="w-6 h-6 hover:opacity-70 cursor-pointer" onClick={() => setIsOpenShareModal(true)}/>
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

      <ShareModal isOpen={isOpenShareModal} onClose={() => setIsOpenShareModal(false)} postId={post._id} />

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
      {isLoadingComments ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
          </div>
        ) :(comments.length > 0 && ( 
        <div className="text-sm space-y-1">
          <button className="text-gray-400 text-sm hover:underline cursor-pointer mb-4" onClick={handleCommentClick}>
            Xem tất cả {comments.reduce((acc, comment) => {
              return acc + 1 + countRepliesRecursive(comment.replies || []);
            }, 0
            )} bình luận
          </button>
        

          {(() => {
          const myComments = comments.filter((c) => c.userId._id === user.id);
          const selectedComment =
            myComments.length > 0
              ? myComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
              : comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

          return selectedComment ? (
            <CommentItem
              key={selectedComment._id}
              comment={selectedComment}
              user={user}
              onReply={(id, name) => {
                setReplyTo(id);
                setReplyToUser(name);
                setComment(`@{${id}}|${name}  `);
                setDisplayComment(`@${name} `);
              }}
              onLike={handleCommentLike}
              onDelete={handleDeleteComment}
              onNavigateToDetail={handleNavigateToDetail}
              mentionUsers={mentionUsers}
            />
          ) : null;
        })()}
        </div>
      ))}

      <div className="flex flex-col pt-3 relative" ref={wrapperRef}>
        {replyToUser && (
          <div className="flex items-center mb-2 py-1 rounded">
          <span className="text-xs text-[var(--text-primary-color)]">
              Đang trả lời <span className="font-semibold">@{replyToUser}</span>
          </span>
          <button
              className="ml-2 text-xs text-red-400 hover:underline cursor-pointer"
              onClick={() => {
              setReplyTo(null);
              setReplyToUser(null);
              setComment("");
              setDisplayComment("");
              }}
          >
              Hủy
          </button>
          </div>
      )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Bình luận..."
            disabled={isCommenting}
            value={displayComment}
            onChange={(e) => {
                const newDisplayValue = e.target.value;
                setDisplayComment(newDisplayValue);

                // Biến lưu mapping giữa tên hiển thị và format đầy đủ
                  let updatedComment = newDisplayValue;

                // Lặp qua tất cả các mention đang có
                  Object.entries(mentionUsers).forEach(([slug, user]) => {
                      const mentionDisplay = `@${user.fullName}`;
                      const mentionMarkup = `@{${slug}}|${user.fullName}`;

                      // Thay thế chuỗi hiển thị thành markup chính xác
                      // Lưu ý: Dùng regex để chỉ thay thế phần đúng (tránh bug khi có tên giống nhau)
                      updatedComment = updatedComment.replace(
                      new RegExp(`@${user.fullName}(?!\\}|\\|)`, 'g'),
                      mentionMarkup
                      );
                  });
                
                // Nếu đang reply và text bắt đầu bằng @Tên
                if (replyTo && newDisplayValue.startsWith(`@${replyToUser}`)) {
                  const afterReplyMention = newDisplayValue.slice(replyToUser.length + 1); // phần sau @Tên
                  let transformedText = afterReplyMention;

                  // ✅ Thay thế các mention còn lại trong phần phía sau
                  Object.entries(mentionUsers).forEach(([slug, user]) => {
                  const mentionDisplay = `@${user.fullName}`;
                  const mentionMarkup = `@{${slug}}|${user.fullName}`;

                  // Ghi chú: tránh chuyển mention chính (replyTo) vì nó đã được xử lý riêng
                  if (user.fullName !== replyToUser) {
                      transformedText = transformedText.replace(
                      new RegExp(`@${user.fullName}(?!\\}|\\|)`, 'g'),
                      mentionMarkup
                      );
                  }
                  });

                  // ✅ Kết hợp lại phần đầu mention + phần sau đã format
                  setComment(`@{${replyTo}}|${replyToUser} ${transformedText}`);
                } else {
                  setComment(updatedComment);
                }
  
                const cursorPos = e.target.selectionStart;
                setCursorPosition(cursorPos);
  
                // ✅ Nếu đã có mention nhưng bị xóa khỏi chuỗi => cho phép mention lại
                const mentionRegex = /@\{[^}]+\}\|[^\s@]+/g;
                const matchesInComment = [...newDisplayValue.matchAll(mentionRegex)];
  
                if (hasMentioned && matchesInComment.length === 0) {
                    setHasMentioned(false); // 🧠 Người dùng đã xóa mention
                }
                if (!hasMentioned) {
                    const atCount = (newDisplayValue.match(/@/g) || []).length;
  
                    const maxAllowedAts = replyTo ? 1 : 0;
                    if (atCount > maxAllowedAts + 1) {
                        setShowSuggestions(false);
                        return;
                    }
                    const textBeforeCursor = newDisplayValue.slice(0, cursorPos);
                    const atMatch = textBeforeCursor.match(/(^|\s)@(\w*)$/);
  
                    if (atMatch) {
                    // ✅ Check nếu con trỏ đang nằm ngay sau một mention => không bật gợi ý
                    const fullMentionRegex = /@\{[^}]+\}\|[^\s@]+/g;
                    let mentionBeforeCursor = false;
  
                    let match;
                    while ((match = fullMentionRegex.exec(newDisplayValue)) !== null) {
                        if (match.index <= cursorPos && fullMentionRegex.lastIndex >= cursorPos) {
                        mentionBeforeCursor = true;
                        break;
                        }
                    }
  
                    if (mentionBeforeCursor) {
                        setShowSuggestions(false);
                        return;
                    }
  
                    const query = atMatch[2]?.toLowerCase() || "";
  
                    if (query === "") {
                        setMentionSuggestions(followings); // Gợi ý toàn bộ nếu chỉ gõ "@"
                    } else {
                        const matches = followings.filter((u) =>
                        u.username.toLowerCase().startsWith(query)
                        );
                        setMentionSuggestions(matches);
                    }
  
                    setShowSuggestions(true);
                    } else {
                    setShowSuggestions(false);
                    }
                }
              }}
              onKeyDown={(e) => {
                if (showSuggestions) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIndex(i =>
                      i < mentionSuggestions.length - 1 ? i + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIndex(i =>
                      i > 0 ? i - 1 : mentionSuggestions.length - 1
                    );
                  } else if (e.key === 'Enter' && activeIndex >= 0) {
                    e.preventDefault();
                    handleSelectMention(mentionSuggestions[activeIndex]);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                  return;
                }
      
                // Nếu không đang show suggestions, xử lý Enter bình thường
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
        {showSuggestions && mentionSuggestions.length > 0 && (
        <div className="absolute z-50 bg-[var(--primary-color)] bottom-full left-0 mb-1 w-[250px] max-h-60 overflow-y-auto">
          {mentionSuggestions.map((user, idx) => (
            <div
              key={user._id}
              className={`flex items-center gap-2 px-3 py-2 hover:bg-[var(--secondary-color)] cursor-pointer border-b border-[var(--border-color)] ${idx === activeIndex ? "bg-[var(--secondary-color)]" : ""}`}
              onClick={() => handleSelectMention(user)}
            >
              <img
                src={user.avatar || "/default-avatar.png"}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-[primary-color] text-xs">{user.fullName}</span>
              </div>
            </div>
          ))}
        </div>
        )}
        </div>
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
