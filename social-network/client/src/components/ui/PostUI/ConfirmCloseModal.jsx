import React from "react";

const ConfirmCloseModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[var(--secondary-color)] text-white rounded-lg w-[400px] text-center p-6">
        <h3 className="text-lg font-semibold mb-2">Bỏ bài viết?</h3>
        <p className="text-sm text-gray-300 mb-4">
          Nếu rời đi, bạn sẽ mất những gì vừa chỉnh sửa.
        </p>
        <div className="space-y-2">
          <button
            onClick={onConfirm}
            className="w-full py-2 rounded-md text-red-500 font-semibold hover:bg-red-500/10 transition-all duration-300 ease-out scale-100 opacity-100 animate-fadeIn cursor-pointer"
          >
            Bỏ
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-md text-white font-semibold hover:bg-white/10 transition-all duration-300 ease-out scale-100 opacity-100 animate-fadeIn cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCloseModal;
