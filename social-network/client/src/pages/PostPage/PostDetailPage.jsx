import { useNavigate, useParams, useSearchParams, useLocation   } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
    getPostDetails,
    toggleLike,
    addComment,
    addReply,
    toggleCommentLike,
    deleteComment,
    deletePost,
    updatePost,
    getReplyChain
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
import { getProfileByUserId, getFollowing  } from "~/api/profile";
import { formatPostTime } from "~/components/utils/formatPostTime";
import { useUser } from "~/context/UserContext";
import { motion } from "framer-motion";
import PostOptionsModal from "~/components/ui/PostUI/Post/PostOptionsModal";
import ConfirmDeleteModal from "~/components/ui/PostUI/Post/ConfirmDeleteModal";
import CommentItem from "~/components/ui/PostUI/Post/CommentItem";
import { usePosts } from '~/context/PostContext';
import PostModal from "~/components/ui/PostUI/PostUpLoadUI/PostModal";
import LikesModal from "~/components/ui/PostUI/Post/LikesModal";
import CopyLinkModal from "~/components/ui/PostUI/Post/CopyLinkModal";
import PostDetailSkeleton from "~/components/ui/PostUI/Post/PostDetailSkeleton";
import UserHoverCard from "~/components/ui/UserHoverCard/UserHoverCard";
import errorImage from '~/assets/img/404.jpg';
import ShareModal from "~/components/ui/PostUI/Share/ShareModal";

export default function PostDetailPage({ isModal = false }) {
    const { updatePostLike, setPosts, posts, updatePostData, setUserPosts, setUserPostsMap, removePostData, refreshPostCount  } = usePosts(); // trong PostDetailPage
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
    const [isCopyModalVisible, setCopyModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [hoverSource, setHoverSource] = useState(null); // 'avatar' or 'name'
    const [isOpenShareModal, setIsOpenShareModal] = useState(false);
    
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const highlightCommentId = params.get("commentId"); // luôn có
    const highlightedCommentIdsRef = useRef(new Set());

    
    // Check lỗi
    const [errorMessage, setErrorMessage] = useState(null);
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
  
      const handleSelectMention = (user) => {
        console.log(user)
        // 1. text hiển thị dạng @Full Name
        const mentionDisplay = `@${user.fullName} `;
        // 2. text internal dạng @{id}|Full Name
        const mentionMarkup  = `@{${user.slug}}|${user.fullName} `;
      
        // 3. Thay phần "@..." cuối chuỗi displayComment
        //    \p{L} là mọi chữ (có dấu), space là khoảng trắng, * nghĩa là nhiều hay ít
        const newDisplay = displayComment.replace(/@[\p{L} ]*$/u, mentionDisplay);
        setDisplayComment(newDisplay);
      
        // 4. Thay phần "@..." cuối chuỗi comment
        //    (?:\{[^}]*\}\|)? để bỏ qua trường hợp cũ đã có @{...}|  
        const newComment = comment.replace(/@(?:\{[^}]*\}\|)?[\p{L} ]*$/u, mentionMarkup);
        setComment(newComment);
      
        // 5. Ẩn dropdown
        setShowSuggestions(false);
      
        // 6. (Tuỳ chọn) di con trỏ về cuối nếu cần, ví dụ:
        //    const newPos = newDisplay.length;
        //    setCursorPosition(newPos);
      };
    
    const handleDelete = () => {
        setShowOptionModal(false);
        setShowConfirmDeleteModal(true); // mở modal xác nhận
    };

    const confirmDelete = async () => {
        try {
            await deletePost(postDetails.post._id); // hoặc postId nếu có sẵn
            setShowConfirmDeleteModal(false);
            // Đồng bộ context
            removePostData(postDetails.post._id);
            if(postDetails?.ownerProfile?.userId){
                const ownerId = postDetails.ownerProfile.userId.toString();
                await refreshPostCount(ownerId); // gọi lại từ server ✅
            }
            navigate(-1); // quay về trang trước
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
        navigate(`/post/${postDetails.post._id}`, { replace: false });
    };

    const handleGoToProfile = () => {
        navigate(`/${info.slug}`, { replace: false });
    };
    
    const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postDetails.post._id}`);
    setShowOptionModal(false);
    setCopyModalVisible(true);

    // Ẩn modal sau 1.5 giây
    setTimeout(() => {
        setCopyModalVisible(false);
    }, 1500);
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
            // Cập nhật state local
            const updatedPostDetails = {
                ...postDetails,
                comments: updateCommentTree(postDetails?.comments),
            };
            setPostDetails(updatedPostDetails);

            // 🎯 Đồng bộ PostContext
            updatePostData(updatedPostDetails);
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
            console.log(profile)
            const fullComment = {
                ...newComment,
                content: comment,
                userId: {
                    _id: user.id,
                    username: user.username,
                    fullName: profile.fullName,
                    avatar: profile.avatar,
                    slug: profile.slug,
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
            const updatedPostData = await fetchPostDetails();
            if (updatedPostData) {
                updatePostData(updatedPostData); // ✨ cập nhật vào context
            }

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
            const updatedPostData = await fetchPostDetails();
            if (updatedPostData) {
                updatePostData(updatedPostData); // ✨ cập nhật vào context
            }
            }
         catch (err) {
            console.error("Lỗi xóa comment:", err);
        }
    };

    const fetchPostDetails = async () => {
        setIsLoading(true); // Bắt đầu loading
        try {
            const response = await getPostDetails(postId);
            const post = response.data.post;
            const comments = response.data.comments || [];
            console.log(response.data);
            
            setPostDetails(response.data); // giữ nguyên dữ liệu backend trả về
            return response.data; // ✨ thêm dòng này để return dữ liệu
        } catch (error) {
            console.error("Error fetching post details:", error);
            if (error.response?.status === 403) {
                setErrorMessage("Bạn không có quyền xem bài viết này.");
            } else if (error.response?.status === 404) {
                setErrorMessage("Bài viết không tồn tại.");
            } else {
                setErrorMessage("Đã xảy ra lỗi khi tải bài viết.");
            }
            } finally {
            setIsLoading(false); // Kết thúc loading dù thành công hay thất bại
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

    if (errorMessage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <img src={errorImage} alt="Lỗi" className="w-80 h-60 mb-8 object-contain" />
                <p className="text-xl font-semibold text-[var(--text-primary-color)]">Rất tiếc, nội dung này hiện chưa thể hiển thị hoặc đã bị xóa</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-8 px-4 py-2 bg-[var(--button-enable-color)] text-[var(--text-primary-color)] rounded-md cursor-pointer hover:opacity-90"
                >
                    Đi tới Trang chủ
                </button>
            </div>
        );
    }

    if (!postDetails && !isModal) {
        return <PostDetailSkeleton />
      }

    // if (isLoading) {
    //     return <PostDetailSkeleton />;
    // }

    // Tính isOwner sau khi đã có postDetails
    const isOwner = user && postDetails?.post?.userId._id === user.id;
    const hasMedia = postDetails?.post?.media?.length > 0;
    const isSingleVideo =
        postDetails?.post.media?.length === 1 &&
        postDetails?.post.media[0].type === "video";
        

    const modalContent = !postDetails ? (
        <PostDetailSkeleton isModal={isModal} />
      ) : (
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
                    <div className="relative" 
                        onMouseEnter={() => setIsHovered(true)}
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
                            {formatPostTime(postDetails.post.createdAt)}
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
                        {showOptionModal && (
                            <PostOptionsModal
                            showGoToPostButton={isModal}
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
                        {
                        isCopyModalVisible &&
                        <CopyLinkModal isVisible={isCopyModalVisible} onClose={() => setCopyModalVisible(false)} />
                        }
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
                                {
                                    // Đưa comment của bạn lên đầu
                                    if (a.userId._id === user.id) return -1; // Nếu comment là của bạn, đặt lên đầu
                                    if (b.userId._id === user.id) return 1;  // Nếu comment b là của bạn, đặt lên đầu
                                    return new Date(b.createdAt) - new Date(a.createdAt); // Sắp xếp các comment còn lại theo thời gian
                                }
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
                                level={0} // ➡️ comment gốc level 0
                                highlightCommentId={highlightCommentId} // Truyền ID comment cần highlight
                                highlightedCommentIdsRef={highlightedCommentIdsRef}
                            />
                        ))}
                </div>
                
                <div className="mt-auto pt-4 border-t-2 border-[var(--border-color)]">
                    <div className="flex items-center justify-between space-x-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-4">
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
                        </div>
                        <Send className="mr-2 text-white cursor-pointer" onClick={() => setIsOpenShareModal(true)} />
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

                    <ShareModal isOpen={isOpenShareModal} onClose={() => setIsOpenShareModal(false)} postId={postDetails.post._id} />
                    
                    {/* Input placeholder */}
                    <div className="flex items-center space-x-2 pt-3 relative" ref={wrapperRef}>
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

                                const cursorPos = e.target.selectionStart;
                                setCursorPosition(cursorPos);

                                const textBeforeCursor = newDisplayValue.slice(0, cursorPos);
                                const atMatch = textBeforeCursor.match(/@(\w*)$/);

                                if (atMatch) {
                                    const query = atMatch[1].toLowerCase();

                                    // ✅ Nếu user chỉ mới gõ "@" (chưa có ký tự gì thêm)
                                    if (query === "") {
                                    console.log("Hiển toàn bộ danh sách:", followings);
                                    setMentionSuggestions(followings); // hiện toàn bộ danh sách
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
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
            <div className="w-full max-w-5xl flex flex-col md:flex-row">
                {modalContent}
            </div>
        </div>
    );
}
