import React, { useEffect, useRef, useState } from 'react';
import VisibilitySelector from './VisibilitySelector';
import { Paperclip, X } from 'lucide-react';
import ConfirmCloseModal from './ConfirmCloseModal';
import { createPost, updatePost,getPostDetails  } from '~/api/post'; // Đường dẫn import tới hàm createPost
import { motion, AnimatePresence } from 'framer-motion'; // ✅ thêm

const PostModal = ({ isOpen, onClose, mode = 'create', initialPostData = null, onUpdate  }) => {
    const [caption, setCaption] = useState('');
    const [files, setFiles] = useState([]);
    const [oldMedia, setOldMedia] = useState([]); // media cũ từ server (URL)
    const [newFiles, setNewFiles] = useState([]); // media mới từ input
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

    const handleEditSubmit = async () => {
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('visibility', visibility);
        
        // Thêm media cũ vào form data
        oldMedia.forEach(url => formData.append('oldMedia', url));
        
        // Thêm media mới vào form data
        newFiles.forEach(file => formData.append('newFiles', file));
      
        try {
            setLoading(true);
            await updatePost(initialPostData._id, formData); // Gửi form data cập nhật bài viết
            const refreshedPost = await getPostDetails(initialPostData._id);
            onUpdate(refreshedPost.data);
            onClose(); // đóng modal sau khi cập nhật thành công
        } catch (err) {
            console.error('Lỗi cập nhật bài viết:', err);
            alert('Cập nhật bài viết thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % allMedia.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
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

    const BASE_URL = "http://localhost:5000";
    useEffect(() => {
        if (mode === 'edit' && initialPostData) {
            setCaption(initialPostData.caption || '');
            setVisibility(initialPostData.visibility || 'public');
    
            // 🔥 Chuyển từ array object → array URL string
            const urls = (initialPostData.media || []).map(item => BASE_URL + item.url);
            setOldMedia(urls);
    
            setNewFiles([]);
            setCurrentIndex(0);
        }
    }, [mode, initialPostData]);

    if (!isOpen) return null;

    // Kiểm tra điều kiện để bật nút Đăng
    const canPost = mode === 'edit'
    ? (
        caption !== initialPostData?.caption ||
        visibility !== initialPostData?.visibility ||
        oldMedia.length !== (initialPostData?.media?.length || 0) ||
        newFiles.length > 0
        )
    : (caption.trim().length > 0 || files.length > 0);

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
    
    const allMedia = mode === 'edit' ? [...oldMedia, ...newFiles] : files;
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
                                        const selected = Array.from(e.target.files);
                                        if (mode === 'edit') {
                                          if ([...oldMedia, ...newFiles, ...selected].length > 10) {
                                            alert('Chỉ được chọn tối đa 10 file!');
                                            return;
                                          }
                                          setNewFiles(prev => [...prev, ...selected]);
                                        } else {
                                          setFiles(prev => [...prev, ...selected]);
                                        }
                                        e.target.value = null;
                                      }}
                                    className="mb-4 hidden"
                                />
                                {allMedia.length > 0 && (
                                <div className="relative mb-4 flex justify-center border-2 border-[var(--border-color)] rounded-lg p-4">
                                    <div className="relative">
                                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs w-10 h-7 rounded-full z-10 text-center leading-7">
                                        {currentIndex + 1}/{allMedia.length}
                                    </div>

                                    {(() => {
                                        const current = allMedia[currentIndex];
                                        if (!current) return null;

                                        if (typeof current === 'string') {
                                        return current.endsWith('.mp4') ? (
                                            <video src={current} className="w-[320px] h-[320px] object-cover rounded-md" controls />
                                        ) : (
                                            <img src={current} className="w-[320px] h-[320px] object-cover rounded-md" alt="old-media" />
                                        );
                                        }

                                        if (current instanceof File) {
                                        return current.type.startsWith('image/') ? (
                                            <img src={URL.createObjectURL(current)} className="w-[320px] h-[320px] object-cover rounded-md" alt="new-media" />
                                        ) : (
                                            <video src={URL.createObjectURL(current)} className="w-[320px] h-[320px] object-cover rounded-md" controls />
                                        );
                                        }

                                        return null;
                                    })()}

                                    {/* Nút xóa */}
                                    <button
                                        onClick={() => {
                                        if (mode === 'edit') {
                                            if (currentIndex < oldMedia.length) {
                                            setOldMedia(oldMedia.filter((_, i) => i !== currentIndex));
                                            } else {
                                            const fileIndex = currentIndex - oldMedia.length;
                                            setNewFiles(newFiles.filter((_, i) => i !== fileIndex));
                                            }
                                        } else {
                                            setFiles(files.filter((_, i) => i !== currentIndex));
                                        }
                                        setCurrentIndex((prev) => Math.max(0, prev - 1));
                                        }}
                                        className="absolute top-2 right-2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    </div>

                                    {/* Nút chuyển trái/phải */}
                                    {allMedia.length > 1 && (
                                    <>
                                        <button
                                        onClick={handlePrev}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white rounded-full w-12 h-12 cursor-pointer"
                                        >
                                        ‹
                                        </button>
                                        <button
                                        onClick={handleNext}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white rounded-full w-12 h-12 cursor-pointer"
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
                                onClick={mode === 'edit' ? handleEditSubmit : handleSubmit}
                                className={`w-full py-2 rounded-md text-white font-medium transition 
                                    ${canPost ? 'bg-[var(--button-enable-color)] hover:bg-blue-600 cursor-pointer' : 'bg-[var(--button-disable-color)] cursor-not-allowed'}`}
                            >
                                {loading ? 'Đang đăng...' : (mode === 'edit' ? 'Cập nhật' : 'Đăng')}
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
