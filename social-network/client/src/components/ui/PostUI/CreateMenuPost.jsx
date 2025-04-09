import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import PostModal from "./PostModal";

const CreateMenuPost = ({ onClose }) => {
    const menuRef = useRef();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
          if (showModal) return;
          if (menuRef.current && !menuRef.current.contains(e.target)) {
              onClose(); // đóng menu khi click ra ngoài
          }
          };

          // Đăng ký sau khi tick hiện tại đã hoàn thành
          const timer = setTimeout(() => {
          document.addEventListener("click", handleClickOutside);
          }, 0);

          return () => {
          clearTimeout(timer);
          document.removeEventListener("click", handleClickOutside);
          };
    }, [onClose, showModal]);

    const menuVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    return (
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            className="absolute left-0 top-full w-full bg-[var(--secondary-color)] text-white rounded-md overflow-hidden shadow-lg border border-neutral-700 z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            transition={{ duration: 0.2 }}
          >
            <div>
              <button
                onClick={() => setShowModal(true)}
                className="flex justify-between items-center w-full p-3 text-sm hover:bg-neutral-700 cursor-pointer">
                Bài viết <ImagePlus size={18} />
              </button>
              <PostModal isOpen={showModal} onClose={() => setShowModal(false)} />

              <button className="flex justify-between items-center w-full p-3 text-sm hover:bg-neutral-700 cursor-pointer">
                AI <Sparkles size={18} />
              </button>
            </div>
          </motion.div>
      </AnimatePresence>
  );
};

export default CreateMenuPost;
