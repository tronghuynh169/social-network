const PostDetailSkeleton = ({ isModal = false }) => {
    return (
      <div
        className={`flex justify-center items-center bg-black text-white ${!isModal ? "w-full h-full" : ""}`}
      >
        {/* Media bên trái */}
        <div className={`bg-[var(--secondary-color)] ${isModal ? "w-[500px] h-[90vh]" : "w-[500px] h-[90vh] ml-35"}`} />
  
        {/* Info bên phải */}
        <div className="p-4 flex-1 space-y-4 w-[500px]">
          {/* Avatar + username */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-700 rounded-full" />
            <div className="h-4 w-32 bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-24 bg-gray-700 rounded" />
          {/* More lines */}
          <div className="h-4 w-1/2 bg-gray-700 rounded" />
          <div className="h-4 w-2/3 bg-gray-700 rounded" />
          <div className="h-4 w-1/3 bg-gray-700 rounded" />
        </div>
      </div>
    );
  };

export default PostDetailSkeleton;
  