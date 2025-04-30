import React from 'react';
import { CheckCircle } from 'lucide-react'; // Import icon

const CopyLinkModal = ({ isVisible, onClose }) => {
  return (
    isVisible && (
      // Modal Overlay (background mờ)
      <div className="fixed inset-0 bg-[var(--primary-color)]/70 flex items-center justify-center z-50">
        {/* Modal */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
          <div className="mb-4">
            <CheckCircle size={50} color="green" />
          </div>
          <p className="text-lg mb-6">Đã sao chép liên kết</p>
          <button
            onClick={onClose}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    )
  );
};

export default CopyLinkModal;