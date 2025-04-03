import { useState, useEffect } from "react";
import { followUser, unfollowUser, checkFollowingStatus } from "~/api/profile";

const FollowButton = ({ currentUserId, profileId }) => {
    const [isFollowing, setIsFollowing] = useState(null); // null = chưa có dữ liệu
    const [loading, setLoading] = useState(true); // Mặc định là true khi khởi tạo
    const [actionLoading, setActionLoading] = useState(false); // Loading khi thực hiện action
    // Kiểm tra trạng thái theo dõi khi component render
    useEffect(() => {
        const fetchFollowingStatus = async () => {
            if (!currentUserId || !profileId) {
                setLoading(false);
                return;
            }

            try {
                const response = await checkFollowingStatus(
                    currentUserId,
                    profileId
                );
                setIsFollowing(response.isFollowing);
            } catch (error) {
                console.error(
                    "❌ Lỗi khi kiểm tra trạng thái theo dõi:",
                    error
                );
                setIsFollowing(false); // Fallback
            } finally {
                setLoading(false);
            }
        };

        fetchFollowingStatus();
    }, [currentUserId, profileId]);

    const handleFollowToggle = async () => {
        if (!currentUserId || !profileId || loading) return;

        setActionLoading(true);

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
            setActionLoading(false);
        }
    };

    // KHÔNG render gì cả cho đến khi dữ liệu sẵn sàng
    if (loading || isFollowing === null) {
        return null; // Hoặc có thể return một placeholder/spinner
    }

    return (
        <button
            className={`px-4 py-2 cursor-pointer text-white rounded-lg transition-all ${
                isFollowing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
            } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleFollowToggle}
            disabled={actionLoading}
        >
            {actionLoading
                ? "Đang xử lý..."
                : isFollowing
                ? "Đang theo dõi"
                : "Theo dõi"}
        </button>
    );
};

export default FollowButton;
