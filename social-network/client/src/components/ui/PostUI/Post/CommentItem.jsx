import { useState } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import LikesCommentModal from "./LikesCommentModal"; // import đúng đường dẫn nếu cần
import { formatPostTime } from "~/components/utils/formatPostTime";
import DeleteCommentModal from "./DeleteCommentModal";

const CommentItem = ({
    comment,
    user,
    onReply,
    onLike,
    onDelete, // Hàm xóa bình luận
    isReply = false,
    // isDirectReply = false, // mới thêm
    level = 0, // ➡️ thêm level mặc định = 0
    isLastReply 
}) => {
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // State để mở modal xóa
    
    // const indentClass = isDirectReply ? `pl-${level * 6}` : "";
    const indentClass = `pl-${level * 6}`; 

    const [showReplies, setShowReplies] = useState(false);
    const hasReplies = comment.replies && comment.replies.length > 0;
    // const allReplies = showReplies ? flattenReplies(comment.replies) : [];

    // Hàm xử lý xóa bình luận
    const handleDelete = () => {
        onDelete(comment._id); // Gọi hàm xóa được truyền vào prop
        setShowDeleteModal(false); // Đóng modal sau khi xác nhận
    };

    return (
        <div className="relative">
        {/* đường thẳng bên trái cho mọi reply */}
        {/* Line dài nếu chưa phải reply cuối */}
         {level > 0 && (
            <div
                className="absolute left-0 w-px bg-gray-300"
                style={{
                left: `${getPaddingLeft(level) - 20}px`,
                top: 0,
                // Nếu không phải reply cuối thì kéo dài thêm 1rem (khoảng space-y-4)
                height: isLastReply 
                ? '1.25rem'           /* h-5 bằng 1.25rem = 20px */ 
                : 'calc(100% + 1rem)' /* 100% + 16px để nối qua gap */
            }}
            aria-hidden
            />
            )}

      {/* móc nhỏ giống Facebook chỉ cho cấp 1 */}
      {level === 1 && (
        <div
          className="absolute w-3 h-3 border-t border-gray-300 bg-transparent"
          style={{
            left: `${getPaddingLeft(level) - 20}px`,
            top: "20px",
          }}
          aria-hidden
        />
      )}

            {/* Móc cho level > 1 (dành cho các reply cấp cao hơn) */}
            {level > 1 && (
            <div
                className="absolute w-3 h-3 border-t border-l border-gray-300 bg-transparent"
                style={{
                left: `${getPaddingLeft(level) - 20}px`,
                top: "20px",
                }}
            />
            )}

    {/* Nội dung chính */}
            <div className="w-full" style={{ paddingLeft: `${getPaddingLeft(level)}px` }}>
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
                        className={`w-4 h-4 cursor-pointer mt-1 hover:opacity-70 ${
                            comment.isLikedComment
                                ? "fill-current text-red-500"
                                : "text-gray-500"
                        }`}
                        onClick={() => onLike(comment._id)}
                    />
                </div>
                {/* Đệ quy hiển thị replies */}
                {/* {allReplies.length > 0 && ( */}
                {hasReplies && (isReply || showReplies) && (
                <div className="mt-4 space-y-4">
                    {comment.replies.map((reply, index) => (
                    <CommentItem
                        key={reply._id}
                        comment={reply}
                        user={user}
                        onReply={onReply}
                        onLike={onLike}
                        onDelete={onDelete}
                        isReply={true}
                        level={isReply ? level : level + 1} // ✅ Sửa chỗ này
                        isLastReply={index === comment.replies.length - 1} // 👈 Thêm dòng này
                    />
                    ))}
                </div>
                )}
            </div>
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
                className="text-[#c8d7e4] hover:underline"
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


const getPaddingLeft = (level) => {
    if (level === 1) {
      return level * 20 + 20; // Level 1: cộng thêm 12px
    }
    return level * 20; // Các level khác
  };


// Hàm đếm tất cả replies ở mọi cấp (đệ quy)
const countReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.reduce(
        (total, reply) => total + 1 + countReplies(reply),
        0
    );
};

// Flatten đệ quy tất cả replies thành mảng phẳng
// const flattenReplies = (replies = []) =>
//     replies.reduce(
//       (acc, reply) => [
//         ...acc,
//         reply,
//         ...flattenReplies(reply.replies),
//       ],
//       []
//     );

 export default CommentItem;
