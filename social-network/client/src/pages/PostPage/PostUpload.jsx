import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

const PostUpload = ({ isOpen, onClose, uploadPost }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(urls);
      setCurrentIndex(0);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    const success = await uploadPost(files, caption);
    if (success) {
      onClose();
      setFiles([]);
      setPreviews([]);
      setCaption("");
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-300 p-4 flex justify-between items-center">
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Tạo bài viết mới</h2>
          <button 
            onClick={handleSubmit}
            className={`text-sm font-semibold ${files.length > 0 ? 'text-blue-500' : 'text-blue-300 cursor-default'}`}
            disabled={files.length === 0}
          >
            Chia sẻ
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 flex items-center justify-center ${previews.length > 0 ? 'bg-black' : 'bg-gray-50'}`}>
            {previews.length > 0 ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={previews[currentIndex]} 
                  alt="Preview" 
                  className="max-h-[70vh] object-contain"
                />
                
                {previews.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                      className={`absolute left-4 bg-black bg-opacity-50 text-white p-2 rounded-full ${currentIndex === 0 ? 'invisible' : ''}`}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setCurrentIndex(prev => Math.min(prev + 1, previews.length - 1))}
                      className={`absolute right-4 bg-black bg-opacity-50 text-white p-2 rounded-full ${currentIndex === previews.length - 1 ? 'invisible' : ''}`}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-xl mb-6">Kéo ảnh và video vào đây</p>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Chọn từ máy tính
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple 
                  accept="image/*,video/*" 
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {previews.length > 0 && (
            <div className="w-80 border-l border-gray-300 flex flex-col">
              <div className="p-4 border-b border-gray-300">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                  <span className="font-semibold text-sm">username</span>
                </div>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  placeholder="Viết chú thích..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full h-full resize-none outline-none text-sm"
                  rows="10"
                ></textarea>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostUpload;