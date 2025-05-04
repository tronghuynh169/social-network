import { useUser } from "~/context/UserContext";
import { MessageCircle  } from "lucide-react";

const UserHoverCard = ({ info }) => {
    const { user } = useUser();
    const isUser = user.id === info.userId;
    return (
      <div className="absolute z-50 top-[40px] left-0 w-80 bg-[var(--primary-color)] text-white rounded-md p-4 shadow-xl border border-[var(--border-color)]">
        {/* Avatar + tên */}
        <div className="flex items-center space-x-3">
          <img
            src={info.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-14 h-14 rounded-full"
          />
          <div>
            <p className="flex items-center gap-1 font-semibold text-base">
            {info.fullName}
            </p>
          </div>
        </div>
  
        {/* Stats */}
        <div className="flex justify-between text-sm mt-4 border-b border-[var(--border-color)] pb-4">
          <div className="text-center">
            <p className="font-bold text-white">1</p>
            <p className="text-gray-400">bài viết</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white">1</p>
            <p className="text-gray-400">người theo dõi</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white">1</p>
            <p className="text-gray-400">đang theo dõi</p>
          </div>
        </div>
  
        {/* Buttons */}
        <div className="flex justify-between mt-4 space-x-2">
            {
                isUser ? ( <button className="flex-1 bg-[var(--button-color)] text-[var(--text-primary-color)] text-sm font-semibold py-2 rounded-lg hover:bg-neutral-700">
                            Trang cá nhân
                        </button> ) :
                (
                    <>
                        <div className="flex-1 flex items-center justify-center bg-[var(--button-enable-color)] text-[var(--text-primary-color)] text-sm font-semibold py-0 rounded-lg hover:opacity-90">
                            <MessageCircle className="w-6 h-6 mr-1"/>
                            <button className="">
                                Nhắn tin
                            </button>
                        </div>
                        <button className="flex-1 bg-[var(--button-color)] text-[var(--text-primary-color)] text-sm font-semibold py-2 rounded-lg hover:bg-neutral-700">
                            Đang theo dõi
                        </button>
                    </>
                )
            }
        </div>
      </div>
    );
  };

  export default UserHoverCard