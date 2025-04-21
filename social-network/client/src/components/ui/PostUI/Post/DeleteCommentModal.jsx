import React from "react";

const DeleteCommentModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#262626] rounded-lg overflow-hidden w-[380px] text-center text-sm">
        <button
          onClick={onConfirm}
          className="w-full py-3 text-red-500 font-semibold hover:bg-[#333] border-b border-[var(--border-color)] cursor-pointer"
        >
          Xóa
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-white hover:bg-[#333] cursor-pointer"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default DeleteCommentModal;
