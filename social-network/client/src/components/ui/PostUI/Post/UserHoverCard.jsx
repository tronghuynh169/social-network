import React, { useState } from 'react';

const UserHoverCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Khu vực hover */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer flex items-center space-x-2"
      >
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <span className="font-semibold text-white">cristiano</span>
      </div>

      {/* Popup hiển thị khi hover */}
      {isHovered && (
        <div
          className="absolute z-50 top-12 left-0 bg-neutral-900 text-white rounded-xl p-4 shadow-xl w-72"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h3 className="text-lg font-bold">Cristiano Ronaldo</h3>
          <div className="flex justify-between text-sm mt-2">
            <div className="text-center">
              <p className="font-bold">3.880</p>
              <p>bài viết</p>
            </div>
            <div className="text-center">
              <p className="font-bold">653 Tr</p>
              <p>người theo dõi</p>
            </div>
            <div className="text-center">
              <p className="font-bold">602</p>
              <p>đang theo dõi</p>
            </div>
          </div>
          <div className="flex justify-between mt-4 space-x-2">
            <button className="bg-white text-black font-semibold px-4 py-1 rounded-lg w-full">
              Nhắn tin
            </button>
            <button className="bg-neutral-800 text-white font-semibold px-4 py-1 rounded-lg w-full">
              Đang theo dõi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHoverCard;
