import { useState, useEffect } from "react";
import { followUser, unfollowUser, checkFollowingStatus } from "~/api/profile";

const FollowButton = ({ currentUserId, profileId }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🛠 Kiểm tra trạng thái theo dõi khi component render
    useEffect(() => {
        const fetchFollowingStatus = async () => {
            if (!currentUserId || !profileId) return;
            try {
                const response = await checkFollowingStatus(
                    currentUserId,
                    profileId
                );
                setIsFollowing(response.isFollowing); // ✅ Cập nhật trạng thái từ server
            } catch (error) {
                console.error(
                    "❌ Lỗi khi kiểm tra trạng thái theo dõi:",
                    error
                );
            }
        };
        fetchFollowingStatus();
    }, [currentUserId, profileId]);

    const handleFollowToggle = async () => {
        if (!currentUserId || !profileId) {
            console.error("⚠️ Lỗi: currentUserId hoặc profileId bị thiếu", {
                currentUserId,
                profileId,
            });
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            if (isFollowing) {
                await unfollowUser(profileId, currentUserId);
                setIsFollowing(false);
            } else {
                await followUser(currentUserId, profileId);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái theo dõi:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`px-4 py-2 cursor-pointer text-white rounded-lg transition-all ${
                isFollowing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleFollowToggle}
            disabled={loading}
        >
            {loading
                ? "Đang tải..." // Nếu chưa lấy xong dữ liệu từ API
                : loading
                ? "Đang xử lý..."
                : isFollowing
                ? "Đang theo dõi"
                : "Theo dõi"}
        </button>
    );
};

export default FollowButton;
