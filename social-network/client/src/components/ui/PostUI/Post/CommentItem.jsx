import { Heart, MoreHorizontal } from "lucide-react";
import LikesCommentModal from "./LikesCommentModal"; // import đúng đường dẫn nếu cần
import { formatPostTime } from "~/components/utils/formatPostTime";

const CommentItem = ({
    comment,
    user,
    onReply,
    onLike,
    isReply = false,
    showLikesModal,
    setShowLikesModal,
}) => {
    return (
        <div
            className={`w-full ${
                isReply ? " mt-2 border-l-[2px] border-gray-300 pl-4" : ""
            }`}
        >
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
                        <span>{comment.content}</span>
                    </p>

                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>{formatPostTime(comment.createdAt)}</span>

                        {comment.likesCommentCount > 0 && (
                            <span
                                onClick={() => setShowLikesModal(true)}
                                className="hover:underline cursor-pointer"
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
                            className="cursor-pointer"
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
            {comment.replies?.length > 0 && (
                <div className="mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={`${comment._id}-${reply._id}`}
                            comment={reply}
                            user={user}
                            onReply={onReply}
                            onLike={onLike}
                            isReply={true} // Set isReply = true để xác định là reply
                            showLikesModal={false}
                            setShowLikesModal={() => {}}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
