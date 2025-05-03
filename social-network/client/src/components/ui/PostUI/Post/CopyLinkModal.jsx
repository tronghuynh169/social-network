import React from 'react';
import { CheckCircle, X } from 'lucide-react'; // Import icon

const CopyLinkModal = ({ isVisible, onClose }) => {
  return (
    isVisible && (
      <div className="fixed inset-0 bg-[var(--primary-color)]/70 flex items-center justify-center z-50">
        {/* Modal */}
        <div className="bg-[var(--secondary-color)] p-6 rounded-lg shadow-lg w-96 text-center relative">
          
          {/* Nút đóng ở góc phải */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-gray-300 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>

          <div className='flex flex-col justify-center items-center'>
            <div className="mb-4 mt-4">
              <CheckCircle size={50} color="white" />
            </div>
            <p className="text-lg mb-6">Đã sao chép liên kết</p>
          </div>
        </div>
      </div>
    )
  );
};

export default CopyLinkModal;