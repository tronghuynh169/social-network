import React, { useEffect, useRef, useState } from 'react';
import VisibilitySelector from './VisibilitySelector';
const PostModal = ({ isOpen, onClose }) => {
    const modalRef = useRef();
    const [caption, setCaption] = useState('');
    const [files, setFiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibility, setVisibility] = useState('public');

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % files.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    };

    // Đóng khi click ra ngoài modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
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

    return (
        <div className="fixed inset-0 bg-[var(--primary-color)]/70 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="rounded-2xl shadow-lg w-full max-w-lg relative bg-[var(--secondary-color)]"
            >
                {/* Header */}
                <div className="bg-[var(--primary-color)] h-[42px] flex justify-center items-center border-b border-[var(--border-color)]">
                    <h2 className="text-md font-semibold">Tạo bài viết</h2>
                </div>

                <div className='max-h-[500px] overflow-y-auto'>
                    <div className="p-6">
                        <VisibilitySelector value={visibility} onChange={setVisibility}/>
                        <div className="mt-6">
                            {/* Nội dung */}
                            <div
                                contentEditable
                                onInput={(e) => setCaption(e.currentTarget.textContent)}
                                className="w-full min-h-[80px] rounded-md p-2 mb-4 focus:outline-none resize-none overflow-hidden bg-[var(--secondary-color)] text-white"
                                placeholder="Bạn đang nghĩ gì?"
                                data-placeholder="Bạn đang nghĩ gì?"
                                >
                            </div>
            
                            {/* Upload hình/video */}
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => setFiles([...e.target.files])}
                                className="mb-4"
                            />
                            {files.length > 0 && (
                                <div className="relative mb-4">
                                    {files[currentIndex].type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(files[currentIndex])}
                                            alt="preview"
                                            className="w-[320px] h-[320px] object-cover rounded-md"
                                        />
                                    ) : (
                                        <video
                                            src={URL.createObjectURL(files[currentIndex])}
                                            className="w-[320px] h-[320px]  object-cover rounded-md"
                                            muted
                                            controls
                                            playsInline
                                        />
                                    )}
                                    {files.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrev}
                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                onClick={handleNext}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"
                                            >
                                                ›
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
            
                            {/* Button đăng */}
                            <button
                                disabled={!canPost}
                                className={`w-full py-2 rounded-md text-white font-medium transition 
                                    ${canPost ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Đăng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostModal;
