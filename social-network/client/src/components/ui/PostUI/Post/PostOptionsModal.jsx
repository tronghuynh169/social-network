const PostOptionsModal = ({
    isOwner,
    onClose,
    onDelete,
    onEdit,
    onGoToPost,
    onCopyLink,
  }) => {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl w-80 overflow-hidden text-center text-sm font-medium">
          {isOwner && (
            <>
              <button
                onClick={onDelete}
                className="text-red-600 py-3 w-full border-b hover:bg-gray-100"
              >
                Xóa
              </button>
              <button
                onClick={onEdit}
                className="py-3 w-full border-b hover:bg-gray-100"
              >
                Chỉnh sửa
              </button>
            </>
          )}
          <button
            onClick={onGoToPost}
            className="py-3 w-full border-b hover:bg-gray-100"
          >
            Đi đến bài viết
          </button>
          <button
            onClick={onCopyLink}
            className="py-3 w-full border-b hover:bg-gray-100"
          >
            Sao chép liên kết
          </button>
          <button
            onClick={onClose}
            className="py-3 w-full hover:bg-gray-100"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  };
  
  export default PostOptionsModal;
  