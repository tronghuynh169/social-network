const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
        <div className="bg-[#262626] rounded-lg overflow-hidden w-[400px] text-center text-sm text-white">
          <div className="py-5 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold">Xóa bài viết?</h2>
            <p className="mt-1 text-[var(--text-secondary-color)]">
              Bạn có chắc chắn muốn xóa bài viết này không?
            </p>
          </div>
          <button
            onClick={onConfirm}
            className="w-full py-3 text-red-500 font-semibold hover:bg-[#333] border-b border-[var(--border-color)]"
          >
            Xóa
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 text-[var(--text-primary-color)] hover:bg-[#333]"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  };
  
  export default ConfirmDeleteModal;
  