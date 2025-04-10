import React, { useEffect, useRef, useState } from 'react';
import VisibilitySelector from './VisibilitySelector';
import { Paperclip, X } from 'lucide-react';
import ConfirmCloseModal from './ConfirmCloseModal';
import { createPost } from '~/api/post'; // Đường dẫn import tới hàm createPost
import { motion, AnimatePresence } from 'framer-motion'; // ✅ thêm

const PostModal = ({ isOpen, onClose }) => {
    const [caption, setCaption] = useState('');
    const [files, setFiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibility, setVisibility] = useState('public');
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef();
    const captionRef = useRef('');
    const filesRef = useRef([]);

    const handleSubmit = async () => {
        if (!canPost || loading) return;
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('visibility', visibility);
        files.forEach((file) => formData.append('files', file));
    
        try {
            setLoading(true);
            const response = await createPost(formData);
            console.log('Bài viết đã đăng:', response.data);
    
            // ✅ Reset form sau khi đăng thành công
            setCaption('');
            setFiles([]);
            setCurrentIndex(0);
            setVisibility('public');
            onClose();
        } catch (error) {
            console.error('Lỗi khi đăng bài:', error);
            alert('Đăng bài thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % files.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    };

    useEffect(() => {
        captionRef.current = caption;
    }, [caption]);
      
      useEffect(() => {
        filesRef.current = files;
    }, [files]);

    // Đóng khi click ra ngoài modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                if (
                captionRef.current.trim() !== '' ||
                filesRef.current.length > 0
                ) {
                setShowConfirmClose(true); // hiện xác nhận
                } else {
                onClose(); // đóng bình thường
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Kiểm tra điều kiện để bật nút Đăng
    const canPost = caption.trim().length > 0 || files.length > 0;

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };
    
      const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -20 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -20 },
      };
    

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-[var(--primary-color)]/70 flex items-center justify-center z-50"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    ref={modalRef}
                    className="rounded-2xl shadow-lg w-full max-w-lg relative bg-[var(--secondary-color)]"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                >
                    {/* Header */}
                    <div className="bg-[var(--primary-color)] h-[42px] relative flex items-center justify-center border-b border-[var(--border-color)]">
                        <h2 className="text-md text-[var(--text-primary-color)] font-semibold">Tạo bài viết</h2>
                        
                        {/* Nút đóng ở góc trên bên phải */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white cursor-pointer hover:opacity-90 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className='max-h-[500px] overflow-y-auto'>
                        <div className="pt-4 px-4">
                            <VisibilitySelector value={visibility} onChange={setVisibility}/>
                            <div className="mt-4">
                                {/* Nội dung */}
                                <textarea
                                value={caption}
                                onChange={(e) => {
                                    setCaption(e.target.value);
                                    e.target.style.height = "auto"; // Reset height trước khi tính
                                    e.target.style.height = e.target.scrollHeight + "px"; // Tự động tăng chiều cao
                                }}
                                placeholder="Bạn đang nghĩ gì?"
                                rows={1}
                                className="w-full resize-none overflow-hidden bg-[var(--secondary-color)] text-white mb-12 rounded-md focus:outline-none"
                                />
                
                                {/* Upload hình/video */}
                                <input
                                    type="file"
                                    id="fileInput"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        const newFiles = [...files, ...e.target.files];
                                        if (newFiles.length > 10) {
                                        alert("Chỉ được chọn tối đa 10 file!");
                                        return;
                                        }
                                        setFiles(newFiles);
                                        e.target.value = null; // ✅ Reset input sau khi xử lý
                                    }}
                                    className="mb-4 hidden"
                                />
                                {files.length > 0 && (
                                <div className="relative mb-4 flex justify-center border-2 border-[var(--border-color)] rounded-lg p-4">
                                    <div className="relative">
                                        {/* Số thứ tự ảnh/video */}
                                        <div className="absolute top-2 left-2 bg-black/50 text-white text-center leading-7 text-xs w-10 h-7 rounded-full z-10">
                                            {currentIndex + 1}/{files.length}
                                        </div>
                                    {files[currentIndex].type.startsWith('image/') ? (
                                        <img
                                        src={URL.createObjectURL(files[currentIndex])}
                                        alt="preview"
                                        className="w-[320px] h-[320px] object-cover rounded-md"
                                        />
                                    ) : (
                                        <video
                                        src={URL.createObjectURL(files[currentIndex])}
                                        className="w-[320px] h-[320px] object-cover rounded-md"
                                        muted
                                        controls
                                        playsInline
                                        />
                                    )}

                                    {/* ❌ Nút xóa */}
                                    <button
                                        onClick={() => {
                                            const updatedFiles = files.filter((_, index) => index !== currentIndex);
                                            setFiles(updatedFiles);
                                            setCurrentIndex((prev) =>
                                            prev === 0 ? 0 : Math.min(prev - 1, updatedFiles.length - 1)
                                            );
                                        }}
                                        className="absolute cursor-pointer top-2 right-2 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center z-10"
                                        >
                                        <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Nút chuyển trái/phải nếu có nhiều file */}
                                    {files.length > 1 && (
                                    <>
                                        <button
                                        onClick={handlePrev}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-xl text-center text-white rounded-full w-12 h-12 hover:bg-black/60 cursor-pointer"
                                        >
                                        ‹
                                        </button>
                                        <button
                                        onClick={handleNext}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-xl text-center text-white rounded-full w-12 h-12 hover:bg-black/60 cursor-pointer"
                                        >
                                        ›
                                        </button>
                                    </>
                                    )}
                                </div>
                                )}
                
                            </div>
                        </div>
                    </div>
                    <div className='px-4 pb-4 mt-4'>
                            <div className='w-full flex items-center justify-between px-4 py-2 my-4 rounded-2xl border border-[var(--border-color)]'>
                                <label
                                    htmlFor="fileInput"
                                    className="cursor-pointer text-[var(--text-primary-color)]"
                                    >
                                    Thêm vào bài viết của bạn
                                </label>
                                <label
                                    htmlFor="fileInput" >
                                    <Paperclip className="w-5 h-5 text-[var(--text-primary-color)] cursor-pointer"/>
                                </label>
                            </div>

                            <button
                                disabled={!canPost || loading}
                                onClick={handleSubmit}
                                className={`w-full py-2 rounded-md text-white font-medium transition 
                                    ${canPost ? 'bg-[var(--button-enable-color)] hover:bg-blue-600 cursor-pointer' : 'bg-[var(--button-disable-color)] cursor-not-allowed'}`}
                            >
                                {loading ? 'Đang đăng...' : 'Đăng'}
                            </button>
                    </div>
                </motion.div>
                {showConfirmClose && (
                <ConfirmCloseModal
                    onConfirm={() => {
                    setCaption('');
                    setFiles([]);
                    setShowConfirmClose(false);
                    onClose();
                    }}
                    onCancel={() => setShowConfirmClose(false)}
                />
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default PostModal;
