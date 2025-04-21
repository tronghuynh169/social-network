import { useState } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import LikesCommentModal from "./LikesCommentModal"; // import đúng đường dẫn nếu cần
import { formatPostTime } from "~/components/utils/formatPostTime";

const CommentItem = ({
    comment,
    user,
    onReply,
    onLike,
    isReply = false,
    isDirectReply = false, // mới thêm
}) => {
    const [showLikesModal, setShowLikesModal] = useState(false);
    const indentClass = isDirectReply ? "pl-12" : "";

    const [showReplies, setShowReplies] = useState(false);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const allReplies = showReplies ? flattenReplies(comment.replies) : [];
    return (
        <div className={`w-full ${indentClass}`}>
            <div className="flex items-start gap-3 w-full">
                {/* Avatar */}
                <img
                    src={comment.userId?.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                />

                {/* Nội dung */}
                <div className="flex-1">
                    <p className="text-sm leading-snug break-words break-all whitespace-pre-wrap">
                        <span className="font-semibold">
                            {comment.userId.fullName || comment.userId.username}
                        </span>{" "}
                        <span>{renderCommentText(comment.content)}</span>
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
                            <MoreHorizontal className="w-4 h-4 cursor-pointer" />
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
                            <button
                                onClick={() => setShowReplies((prev) => !prev)}
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
                    className={`w-4 h-4 cursor-pointer mt-1 ${
                        comment.isLikedComment
                            ? "fill-current text-red-500"
                            : "text-gray-500"
                    }`}
                    onClick={() => onLike(comment._id)}
                />
            </div>
            {/* Đệ quy hiển thị replies */}
            {allReplies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {allReplies.map((reply) => (
                        <CommentItem
                            key={`${comment._id}-${reply._id}`}
                            comment={reply}
                            user={user}
                            onReply={onReply}
                            onLike={onLike}
                            isReply={true} // Set isReply = true để xác định là reply
                            isDirectReply={!isReply} // chỉ reply cấp 1 mới thụt
                            showLikesModal={false}
                            setShowLikesModal={() => {}}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// 🔍 Chuyển @Tên -> <a>
function renderCommentText(text) {
    const regex = /@{(.+?)}\|([^\|@]+?)  /g; // Hai dấu cách ở cuối
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const [fullMatch, userId, fullName] = match;
        const start = match.index;

        if (start > lastIndex) {
            parts.push(text.slice(lastIndex, start));
        }

        parts.push(
            <a
                key={userId}
                href={`/user/${userId}`}
                className="text-blue-400 hover:underline"
            >
                @{fullName.trim()}
            </a>,
            ' ' // Một khoảng trắng để giữ đúng spacing sau thẻ <a>
        );

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
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
