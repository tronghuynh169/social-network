import { useEffect, useState } from "react";
import { getPostDetails } from "~/api/post";
import { 
  getProfileByUserId,
  getFollowing,
  followUser,
  unfollowUser  
} from "~/api/profile";

const LikesModal = ({ postId, currentUserId, onClose }) => {
  const [likesUsers, setLikesUsers] = useState([]);
  const [followingList, setFollowingList] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: postData } = await getPostDetails(postId);
        const currentUserProfile = await getProfileByUserId(currentUserId);
        const followingData = await getFollowing(currentUserProfile._id);
        const followingUserIds = new Set(followingData.map(profile => profile.userId));
        console.log("followingUserIds" , followingUserIds);
        console.log("postdata: " , postData.likes);
        const sortedUsers = [...postData.likes].sort((a, b) => {
          const aIsFollowing = followingUserIds.has(a._id);
          const bIsFollowing = followingUserIds.has(b._id);

          const aIsSelf = a._id === currentUserId;
          const bIsSelf = b._id === currentUserId;

          if (aIsSelf) return 1;
          if (bIsSelf) return -1;
          if (aIsFollowing === bIsFollowing) return 0;
          return aIsFollowing ? -1 : 1;
        });

        setLikesUsers(sortedUsers);
        setFollowingList(followingUserIds);
        setLoading(false);
    } catch (err) {
        console.error("Lỗi:", err);
        setLoading(false);
    }
};

    fetchData();
  }, [postId, currentUserId]);

  const handleFollowToggle = async (targetId) => {
    setFollowingLoading(prev => ({ ...prev, [targetId]: true }));

    try {
      const updatedSet = new Set(followingList);

      if (updatedSet.has(targetId)) {
        await unfollowUser(targetId);
        updatedSet.delete(targetId);
      } else {
        await followUser(targetId);
        updatedSet.add(targetId);
      }

      setFollowingList(updatedSet);

      setLikesUsers(prev => [...prev].sort((a, b) => {
        const aIsFollowing = updatedSet.has(a._id);
        const bIsFollowing = updatedSet.has(b._id);

        const aIsSelf = a._id === currentUserId;
        const bIsSelf = b._id === currentUserId;

        if (aIsSelf) return 1;
        if (bIsSelf) return -1;
        if (aIsFollowing === bIsFollowing) return 0;
        return aIsFollowing ? -1 : 1;
      }));
    } catch (error) {
      console.error("Lỗi theo dõi:", error);
    } finally {
      setFollowingLoading(prev => ({ ...prev, [targetId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-neutral-900 text-white w-[400px] max-h-[80vh] rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-700">
          <h3 className="text-center text-lg font-bold">Lượt thích</h3>
          <button onClick={onClose} className="text-2xl text-neutral-400 hover:text-white">&times;</button>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[65vh]">
          {loading ? (
            <div className="text-center py-6 text-neutral-400">Đang tải...</div>
          ) : likesUsers.length === 0 ? (
            <div className="text-center py-6 text-neutral-400">Chưa có lượt thích nào</div>
          ) : (
            likesUsers.map(user => {
              const isMe = user._id === currentUserId;
              const isFollowing = followingList.has(user._id);

              return (
                <div key={user._id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-800 transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-white">{user.username}</p>
                      {user.fullName && <p className="text-neutral-400 text-xs">{user.fullName}</p>}
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => handleFollowToggle(user._id)}
                      disabled={followingLoading[user._id]}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                        isFollowing
                          ? "bg-neutral-800 text-white border border-neutral-600 hover:bg-neutral-700"
                          : "bg-sky-500 text-white hover:bg-sky-600"
                      }`}
                    >
                      {followingLoading[user._id]
                        ? "Đang xử lý..."
                        : isFollowing
                        ? "Đang theo dõi"
                        : "Theo dõi"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LikesModal;
