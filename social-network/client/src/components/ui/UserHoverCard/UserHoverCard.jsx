import { useUser } from "~/context/UserContext";
import { useState, useEffect, useRef } from "react";
import { MessageCircle  } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserPostCount } from '~/api/post';
import {
  getProfileByUserId,
  getFollowing,
  followUser,
  unfollowUser,
} from "~/api/profile";

const UserHoverCard = ({ info, hoverPosition, onFollowChange }) => {
    const navigate = useNavigate(); 
    const { user } = useUser();
    const isUser = user.id === info?.userId;
    const [postCount, setPostCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);
    const [isReadyToShow, setIsReadyToShow] = useState(false);
    const [confirmUnfollow, setConfirmUnfollow] = useState({
      show: false,
      userId: null,
      fullName: "",
      avatar: "",
    });
    const [actionLoadingMap, setActionLoadingMap] = useState({});

    const handleGoToProfile = () => {
      navigate(`/${info.slug}`, { replace: false });
    };

    const handleFollowToggle = async () => {
      setFollowingLoading(true);
      try {
        const currentUserProfile = await getProfileByUserId(user.id);
        let newStatus;
        if (isFollowing) {
          await unfollowUser(info._id, currentUserProfile._id);
          newStatus = false;
        } else {
          await followUser(currentUserProfile._id, info._id);
          newStatus = true;
        }
        setIsFollowing(!isFollowing);
        onFollowChange?.(info.userId, newStatus);
      } catch (error) {
        console.error("Lỗi khi thay đổi trạng thái theo dõi:", error);
      } finally {
        setFollowingLoading(false);
      }
    };

    const performUnfollow = async (targetUserId) => {
      setActionLoadingMap((prev) => ({ ...prev, [targetUserId]: true }));
      try {
        const currentUserProfile = await getProfileByUserId(user.id);
        const targetUserProfile = await getProfileByUserId(targetUserId); // 🔍 Lấy profile của người kia
        await unfollowUser(targetUserProfile._id, currentUserProfile._id);
        setIsFollowing(false);
        // đồng bộ parent
        onFollowChange?.(targetUserId, false);
        setConfirmUnfollow({ show: false, userId: null, fullName: "", avatar: "" });
      } catch (error) {
        console.error("Lỗi khi bỏ theo dõi:", error);
      } finally {
        setActionLoadingMap((prev) => ({ ...prev, [targetUserId]: false }));
      }
    };

    useEffect(() => {
      const fetchPostCount = async () => {
        if (!info?.userId) return; // kiểm tra trước khi gọi
        const count = await getUserPostCount(info.userId);
        setPostCount(count);
      };
      fetchPostCount();
    }, [info?.userId]);

    useEffect(() => {
      const fetchFollowingStatus = async () => {
        try {
          const currentUserProfile = await getProfileByUserId(user.id);
          const followingData = await getFollowing(currentUserProfile._id);
          const followingUserIds = new Set(followingData.map(profile => profile.userId));
          setIsFollowing(followingUserIds.has(info.userId));
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái theo dõi:", error);
        }
        finally {
          setIsReadyToShow(true); // <-- đánh dấu đã xong
        }
      };
    
      if (user.id !== info.userId) {
        fetchFollowingStatus();
      }
      else {
        setIsReadyToShow(true); // tự xem mình thì vẫn cho hiển thị
      }
    }, [user?.id, info?.userId]);

    if (!isReadyToShow) return null; // chưa sẵn sàng thì không render gì cả

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute z-50 w-80 bg-[var(--primary-color)] text-white rounded-md p-4 
          shadow-[0_4px_20px_rgba(255,255,255,0.25)] 
          hover:shadow-[0_6px_24px_rgba(255,255,255,0.3)] 
          transition-shadow duration-300 
          border border-[var(--border-color)] 
          ${hoverPosition == 'avatar' ? "top-[40px] left-0" : "top-[30px] left-[50px]"}`}
      >
        {/* Avatar + tên */}
        <div className="flex items-center space-x-3">
          <img
            src={info.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-14 h-14 rounded-full cursor-pointer hover:opacity-90"
            onClick={handleGoToProfile}
          />
          <div>
            <p onClick={handleGoToProfile} 
              className="flex items-center gap-1 font-semibold cursor-pointer"
            >
              {info.fullName}
            </p>
          </div>
        </div>
  
        {/* Stats */}
        <div className="flex justify-between text-sm mt-4 border-b border-[var(--border-color)] pb-4">
          <div className="text-center">
            <p className="text-[var(--text-secondary-color: #a8a8a8)]">{postCount}</p>
            <p className="text-[var(--text-secondary-color: #a8a8a8)]">bài viết</p>
          </div>
          <div className="text-center">
            <p className="text-[var(--text-secondary-color: #a8a8a8)]">{info.followers?.length || "0"}</p>
            <p className="text-[var(--text-secondary-color: #a8a8a8)]">người theo dõi</p>
          </div>
          <div className="text-center">
            <p className="text-[var(--text-secondary-color: #a8a8a8)]">{info.following?.length || "0"}</p>
            <p className="text-[var(--text-secondary-color: #a8a8a8)]">đang theo dõi</p>
          </div>
        </div>
  
        {/* Buttons */}
        <div className="flex justify-between mt-4 space-x-2">
            {
                isUser ? ( <button onClick={(e) => {
                  console.log("đã được bấm")
                  handleGoToProfile();
                }} className="flex-1 bg-[var(--button-color)] text-[var(--text-primary-color)] text-sm font-semibold py-2 rounded-lg hover:bg-neutral-700 cursor-pointer">
                            Trang cá nhân
                        </button> ) :
                (
                    <>
                        <div className="flex-1 flex items-center justify-center bg-[var(--button-enable-color)] text-[var(--text-primary-color)] text-sm font-semibold py-0 rounded-lg hover:opacity-90 cursor-pointer">
                            <MessageCircle className="w-6 h-6 mr-1"/>
                            <button className="">
                                Nhắn tin
                            </button>
                        </div>
                        <button
                          onClick={() => {
                            if (isFollowing) {
                              setConfirmUnfollow({
                                show: true,
                                userId: info.userId,
                                fullName: info.fullName,
                                avatar: info.avatar || "/default-avatar.png",
                              });
                            } else {
                              handleFollowToggle();
                            }
                          }}
                          disabled={followingLoading}
                          className={`flex-1 ${isFollowing ? 'bg-[var(--button-color)]' : 'bg-[var(--button-enable-color)]'} text-[var(--text-primary-color)] text-sm font-semibold py-2 rounded-lg hover:opacity-90 cursor-pointer`}
                        >
                          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                        </button>
                    </>
                )
            }
            {confirmUnfollow.show && (
            <motion.div
              className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay transition-opacity duration-300 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--secondary-color)] rounded-lg w-full max-w-sm text-center"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <img
                  src={confirmUnfollow.avatar}
                  alt={confirmUnfollow.fullName}
                  className="w-[90px] h-[90px] rounded-full overflow-hidden mx-auto mt-7"
                />
                <h3 className="text-[14px] my-5">
                  Bỏ theo dõi @{confirmUnfollow.fullName}?
                </h3>
                <div className="flex flex-col text-[14px]">
                  <button
                    onClick={() => performUnfollow(confirmUnfollow.userId)}
                    className="py-3 px-8 cursor-pointer text-[var(--text-button-color)] font-bold border-t border-[var(--button-color)]"
                    disabled={actionLoadingMap[confirmUnfollow.userId]}
                  >
                    {actionLoadingMap[confirmUnfollow.userId] ? "Đang xử lý..." : "Bỏ theo dõi"}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmUnfollow({ show: false, userId: null, fullName: "", avatar: "" })
                    }
                    className="py-3 px-8 cursor-pointer border-t border-[var(--button-color)]"
                  >
                    Hủy
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  export default UserHoverCard;