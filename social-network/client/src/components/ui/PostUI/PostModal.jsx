import React, { useEffect, useRef, useState } from 'react';
import VisibilitySelector from './VisibilitySelector';
import { Paperclip, X } from 'lucide-react';


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
                    <div className="pt-4 px-4">
                        <VisibilitySelector value={visibility} onChange={setVisibility}/>
                        <div className="mt-4">
                            {/* Nội dung */}
                            <div className="relative w-full">
                            {/* Giả placeholder */}
                            {caption.trim() === "" && (
                                <span className="absolute top-0 left-0 text-gray-400 pointer-events-none select-none">
                                Bạn đang nghĩ gì?
                                </span>
                            )}

                            <div
                                contentEditable
                                onInput={(e) => setCaption(e.currentTarget.textContent)}
                                className="w-full min-h-[80px] rounded-md mb-4 focus:outline-none resize-none overflow-hidden bg-[var(--secondary-color)] text-white p-0"
                            ></div>
                            </div>
            
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
                                  }}
                                className="mb-4 hidden"
                            />
                            {files.length > 0 && (
                            <div className="relative mb-4 flex justify-center">
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
                                className="cursor-pointer"
                                >
                                Thêm vào bài viết của bạn
                            </label>
                            <label
                                htmlFor="fileInput" >
                                <Paperclip className="w-5 h-5 text-green-600 cursor-pointer"/>
                            </label>
                        </div>

                    <button
                        disabled={!canPost}
                        className={`w-full py-2 rounded-md text-white font-medium transition 
                            ${canPost ? 'bg-[var(--button-enable-color)] hover:bg-blue-600' : 'bg-[var(--button-disable-color)] cursor-not-allowed'}`}
                    >
                        Đăng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostModal;
