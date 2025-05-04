import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const PostOptionsModal = ({
    showGoToPostButton,
    isOwner,
    onClose,
    onDelete,
    onEdit,
    onGoToPost,
    onCopyLink,
  }) => {
    const location = useLocation();
    const isInPageView = location.pathname.includes("/page"); // tùy vào path bạn muốn chặn
    

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
        <div className="bg-[#262626] rounded-lg overflow-hidden w-[380px] text-center text-sm">
          {isOwner && (
            <>
              <button
                onClick={onDelete}
                className="w-full py-3 text-red-500 font-semibold hover:bg-[#333] border-b border-[var(--border-color)] cursor-pointer"
              >
                Xóa
              </button>
              <button
                onClick={onEdit}
                className="w-full py-3 text-[var(--text-primary-color)] hover:bg-[#333] border-b border-[var(--border-color)] cursor-pointer"
              >
                Chỉnh sửa
              </button>
            </>
          )}
          { showGoToPostButton &&
            <button
              onClick={onGoToPost}
              className="w-full py-3 text-[var(--text-primary-color)] hover:bg-[#333] border-b border-[var(--border-color)] cursor-pointer"
            >
              Đi đến bài viết
            </button>
          }
          <button
            onClick={onCopyLink}
            className="w-full py-3 text-[var(--text-primary-color)] hover:bg-[#333] border-b border-[var(--border-color)] cursor-pointer"
          >
            Sao chép liên kết
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[var(--text-primary-color)] hover:bg-[#333] border-b border-[var(--border-color)] cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  };
  
  export default PostOptionsModal;
  