import { useEffect, useState, useRef } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import LikesCommentModal from "./LikesCommentModal"; // import đúng đường dẫn nếu cần
import { formatPostTime } from "~/components/utils/formatPostTime";
import DeleteCommentModal from "./DeleteCommentModal";
import { getProfileByUserId } from "~/api/profile";
import { getReplyProfile } from "~/api/post";
import { useNavigate, Link, useLocation  } from "react-router-dom";
import UserHoverCardPortal from "~/components/ui/UserHoverCard/UserHoverCardPortal";
import Mention from "./Mention"; // đường dẫn tương ứng

const CommentItem = ({
    comment,
    user,
    onReply,
    onLike,
    onDelete, // Hàm xóa bình luận
    isReply = false,
    isDirectReply = false, // mới thêm
    onNavigateToDetail,
    highlightCommentId,
    highlightedCommentIdsRef
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [profile, setProfile] = useState();
    const [showDeleteModal, setShowDeleteModal] = useState(false); // State để mở modal xóa
    const indentClass = isDirectReply ? "pl-12" : "";
    const [showReplies, setShowReplies] = useState(false);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [hoverPosition, setHoverPosition] = useState("avatar"); // hoặc 'name'

    const [replyToUser, setReplyToUser] = useState(null);

    const avatarRef = useRef(null);
    const nameRef = useRef(null);
    const hoverCardRef = useRef(null); // Thêm dòng này để khai báo hoverCardRef
    const hoverTimeoutRef = useRef(null);

    const hasReplies = comment.replies && comment.replies.length > 0;
    // Check xem user hiện tại có từng reply comment này không
    const hasUserReplied = comment.replies?.some(
        (reply) => reply.userId._id === user.id
    );

    const allReplies = showReplies ? flattenReplies(comment.replies) : [];
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        if (!isReply && highlightCommentId && comment.replies?.length > 0) {
            const all = flattenReplies(comment.replies);
            const isMatch = all.some(reply => reply._id === highlightCommentId);
            if (isMatch) {
                setShowReplies(true);
            }
        }
    }, [highlightCommentId, comment.replies]);

    const commentRef = useRef(null);
    const hasHighlightedRef = useRef(false);
    const timerRef = useRef(null);
    const hasBeenHighlightedRef = useRef(false); // thay cho state

    useEffect(() => {
    if (
        comment._id === highlightCommentId &&
        !highlightedCommentIdsRef.current.has(comment._id)
    ) {
        console.log("1: Bật highlight");
        highlightedCommentIdsRef.current.add(comment._id);
        setIsHighlighted(true);

        commentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        });

        setTimeout(() => {
        console.log("3: Tắt highlight");
        setIsHighlighted(false);

        // ❌ KHÔNG cần xoá commentId khỏi URL
        // --> Giữ nguyên location.search
        }, 2000);
    }
    }, [comment._id, highlightCommentId, highlightedCommentIdsRef]);


    const highlightClass = isHighlighted
    ? "bg-yellow-100 ring-2 ring-yellow-400/50 shadow-md animate-pulse rounded-md transition duration-500"
    : "";

    // 1. Khởi tạo state từ localStorage (lazy initializer)
    const [newReplyIds, setNewReplyIds] = useState([]);
    const hasMounted = useRef(false);

    const initialOwnReplyIds = useRef([]);


    useEffect(() => {
    const all = flattenReplies(comment.replies || []);
    initialOwnReplyIds.current = all
        .filter(r => r.userId._id === user.id)
        .map(r => r._id);
    }, [comment._id]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfileByUserId(user.id);
                setProfile(res);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
    
        if (user?.id) {
            fetchProfile();
        }
    }, [user.id]); 

    
   // 0. On mount: clear any leftover newReplies (state + localStorage)
   useEffect(() => {
     const key = `newReplies-${comment._id}`;
     // Xóa localStorage nếu có
     localStorage.removeItem(key);
     // Reset state
     setNewReplyIds([]);
   }, [comment._id]);

     // 2. Khi comment.replies thay đổi, cập nhật cả state và localStorage
     useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        // Lần update thứ 2+ khi comment.replies thay đổi:
        const all = flattenReplies(comment.replies || []);
        const myReplies = all.filter(r => r.userId._id === user.id);
        if (myReplies.length === 0) return;

        const idsFromReplies = myReplies.map(r => r._id);
        // Lấy current state, gộp vào
        setNewReplyIds(prev => {
            const merged = Array.from(new Set([...prev, ...idsFromReplies]));
            return merged;
        });
        }, [comment.replies, user.id, comment._id]);

      const handleGoToProfile = async () => {
        const info = await getProfileByUserId(comment.userId._id);
        if (info) {
          navigate(`/${info.slug}`);
        }
      };

    // Hàm fetch info khi hover
    const handleMouseEnter = async (position) => {
        setHoverPosition(position);
        try {
        const info = await getProfileByUserId(comment.userId._id);
        setHoverInfo(info);
        setShowHoverCard(true);
        } catch (err) {
        console.error("Lỗi fetch hover info:", err);
        }
    };

    const handleMouseLeave = (event) => {
        const toElement = event.relatedTarget;
    
        if (!toElement) {
            hideHoverCard();
            return;
        }
    
        const allowedRefs = [avatarRef, nameRef, hoverCardRef];
    
        const stillInside = allowedRefs.some(ref =>
            ref.current && ref.current.contains(toElement)
        );
    
        if (!stillInside) {
            hoverTimeoutRef.current = setTimeout(() => {
                hideHoverCard();
            }, 50); // nhỏ delay để tránh nhấp nháy
        }
    };
    
    const hideHoverCard = () => {
        setHoverPosition(null);
        setShowHoverCard(false);
    };

    const handleReply = async (commentId) => {
        try {
            const response = await fetch(`/api/comments/reply-profile/${commentId}`);
            const data = await response.json();
    
            if (response.ok) {
                setReplyToUser({
                    name: data.profile.fullName || data.profile.username,
                    slug: data.profile.slug,
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người được trả lời:", error);
        }
    };


    const newRepliesToRender = flattenReplies(comment.replies || []).filter(
    r =>
        // chỉ lấy những reply do mình tạo
        r.userId._id === user.id &&
        // và mà không có trong snapshot ban đầu
        !initialOwnReplyIds.current.includes(r._id) 
    );

    return (
        <div className={`w-full ${indentClass}`}>
            <div className="flex items-start gap-3 w-full relative ">
                {/* Avatar */}
                <img
                    ref={avatarRef}
                    src={comment.userId?.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-90"
                    onClick={handleGoToProfile}
                    onMouseEnter={() => handleMouseEnter("avatar")}
                    onMouseLeave={handleMouseLeave}
                />

                {/* Nội dung */}
                <div className={`flex-1`}>
                    <p ref={commentRef} className={`text-sm leading-snug break-words break-all whitespace-pre-wrap transition-all duration-500 
                                     ${highlightClass}`}>
                        <span 
                            ref={nameRef}
                            className="font-semibold cursor-pointer"
                            onMouseEnter={() => handleMouseEnter("name")}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleGoToProfile}
                        >
                            {comment.userId.fullName || comment.userId.username}
                        </span>{" "}
                        {renderCommentText(comment.content)}
                    </p>

                    <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-secondary-color)]">
                        <span>{formatPostTime(comment.createdAt)}</span>

                        {comment.likesCommentCount > 0 && (
                            <span
                                onClick={() => setShowLikesModal(true)}
                                className="hover:underline cursor-pointer text-[var(--text-secondary-color)]"
                            >
                                {comment.likesCommentCount} lượt thích
                            </span>
                        )}

                        <span
                            onClick={() =>
                                onReply(
                                    comment._id,
                                    comment.userId.fullName ||
                                        comment.userId.username
                                )
                            }
                            className="cursor-pointer text-[var(--text-secondary-color)]"
                        >
                            Trả lời
                        </span>

                        {comment.userId._id === user.id && (
                            <>
                                <MoreHorizontal
                                    className="w-4 h-4 cursor-pointer"
                                    onClick={() => setShowDeleteModal(true)}
                                />
                                <DeleteCommentModal
                                    isOpen={showDeleteModal}
                                    onClose={() => setShowDeleteModal(false)}
                                    onConfirm={() => {
                                        onDelete(comment._id); // Gọi hàm xóa
                                        setShowDeleteModal(false);
                                    }}
                                />
                            </>
                        )}

                        {showLikesModal && (
                            <LikesCommentModal
                                postId={comment.postId}
                                commentId={comment._id}
                                currentUserId={user.id}
                                onClose={() => setShowLikesModal(false)}
                            />
                        )}
                    </div>

                    {/* Nút xem câu trả lời */}
                    {!isReply && hasReplies && (
                        <div className="flex items-center mt-4">
                            <div className="h-[1px] w-[20px] bg-[var(--text-secondary-color)] inline-block "/>
                            {hasUserReplied && (
                                <div className="ml-2">
                                    <img
                                        src={profile?.avatar || "/default-avatar.png"}
                                        alt="avatar"
                                        className="w-4 h-4 rounded-full object-cover"
                                    />
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    if (onNavigateToDetail) {
                                    onNavigateToDetail();
                                    } else {
                                    if (showReplies) {
                                        // CHÚ Ý: chuẩn bị ẩn, cập nhật snapshot baseline
                                        const all = flattenReplies(comment.replies || []);
                                        initialOwnReplyIds.current = all
                                        .filter(r => r.userId._id === user.id)
                                        .map(r => r._id);
                                    }
                                    // ẩn hoặc show
                                    setShowReplies(prev => !prev);
                                    }
                                }}
                                className="ml-2 text-[var(--text-secondary-color)] text-[12px] cursor-pointer"
                            >
                                {showReplies
                                    ? "Ẩn câu trả lời"
                                    : `Xem câu trả lời (${countReplies(comment)})`}
                            </button>
                        </div>
                    )}
                </div>
                {/* Icon like */}
                <Heart
                    className={`w-4 h-4 cursor-pointer mt-1 hover:opacity-70 ${
                        comment.isLikedComment
                            ? "fill-current text-red-500"
                            : "text-gray-500"
                    }`}
                    onClick={() =>onLike(comment._id)}
                />
            </div>

        {/* Hiển thị hover card */}
        {showHoverCard && hoverInfo && (
            <UserHoverCardPortal
                targetRef={hoverPosition === "avatar" ? avatarRef : nameRef}
                user={hoverInfo}
                hoverPosition={hoverPosition}
                onMouseEnter={() => {
                    clearTimeout(hoverTimeoutRef.current);
                }}
                onMouseLeave={handleMouseLeave} // 👈 dùng chung hàm handleMouseLeave
                onFollowChange={() => {}} // hoặc hàm xử lý follow nếu có
                source="CommentItem"
                ref={hoverCardRef}
            />
        )}
        {!isReply && !showReplies && newRepliesToRender.length > 0 &&(
        <div className="mt-4 space-y-4">
          {newRepliesToRender.map((reply) => {
            return <CommentItem
                key={reply._id}
                comment={reply}
                user={user}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                isReply={true}
                isDirectReply={true}
                showLikesModal={false}
                setShowLikesModal={() => {}}
            />
        })}
        </div>
      )}
            {/* Đệ quy hiển thị replies */}
            {allReplies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {allReplies.map((reply) => {
                        return <CommentItem
                            key={`${comment._id}-${reply._id}`}
                            comment={reply}
                            user={user}
                            onReply={onReply}
                            onDelete={onDelete}
                            onLike={onLike}
                            isReply={true} // Set isReply = true để xác định là reply
                            isDirectReply={!isReply} // chỉ reply cấp 1 mới thụt
                            showLikesModal={false}
                            setShowLikesModal={() => {}}
                            highlightCommentId={highlightCommentId} // truyền xuống
                            highlightedCommentIdsRef={highlightedCommentIdsRef} // truyền xuống
                        />
                })}
                </div>
            )}
        </div>
    );
};


// 🔍 Chuyển @Tên -> <a>
 function renderCommentText(text) {
    // Regex cải tiến để xử lý chính xác mọi trường hợp
    const regex = /@(?:\{([^}]+)\}\|)?([\p{Lu}][\p{L}'-]*(?: [\p{Lu}][\p{L}'-]*)*)(?=\s|$|@)/gu;
  
    const parts = [];
    let lastIndex = 0;
    let match;
  
    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, userId, fullName] = match;
      const start = match.index;
  
      // Thêm text bình thường trước mention
      if (start > lastIndex) {
        parts.push(
          <span key={lastIndex}>{text.slice(lastIndex, start)}</span>
        );
      }
      // Kiểm tra userId: 24 hex → ObjectId, ngược lại slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(userId);

    if (isObjectId) {
      // ObjectId → dùng Mention để fetch profile và lấy slug
      parts.push(
        <Mention
          key={`${userId}-${start}`}
          commentId={userId}
          fallbackName={fullName.trim()}
        />
      );
    } else {
      // Đã là slug → render Link thẳng, không gọi API
      parts.push(
        <Link
          key={`${userId}-${start}`}
          to={`/${userId}`}
          className="text-[#c8d7e4] hover:underline"
        >
          @{fullName.trim()}
        </Link>
      );
    }
  
      lastIndex = start + fullMatch.length;
    }
  
    // Thêm phần text còn lại
    if (lastIndex < text.length) {
      parts.push(
        <span key={lastIndex + '-end'}>{text.slice(lastIndex)}</span>
      );
    }
  
    return <>{parts}</>;
}





// Hàm đếm tất cả replies ở mọi cấp (đệ quy)
const countReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.reduce(
        (total, reply) => total + 1 + countReplies(reply),
        0
    );
};

// Flatten đệ quy tất cả replies thành mảng phẳng
const flattenReplies = (replies = []) =>
    replies.reduce(
      (acc, reply) => [
        ...acc,
        reply,
        ...flattenReplies(reply.replies),
      ],
      []
    );

export default CommentItem;