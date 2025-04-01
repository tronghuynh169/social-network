// PostMenu.js (đổi tên từ CreateMenu để nhất quán)
import { useState, useRef, useEffect } from "react";
import { ImageIcon, VideoIcon } from "lucide-react";

const PostMenu = ({ isOpen, onClose, onSelectPost }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
    >
      <div
        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          onSelectPost();
          onClose();
        }}
      >
        <ImageIcon className="w-5 h-5 mr-3 text-gray-700" />
        <span className="text-sm font-medium">Bài viết</span>
      </div>
      <div className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
        <VideoIcon className="w-5 h-5 mr-3 text-gray-700" />
        <span className="text-sm font-medium">Video</span>
      </div>
    </div>
  );
};

export default PostMenu;