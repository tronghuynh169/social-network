import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    getProfileBySlug,
    getProfileByUsername,
    getFollowers,
    getFollowing,
} from "~/api/profile";
import { Settings } from "lucide-react";
import AvatarSyncModal from "~/components/ui/ProfileUI/AvatarModal";
import { useUser } from "~/context/UserContext";
import FollowButton from "~/components/ui/ProfileUI/FollowButton/FollowButton";
import FollowersDialog from "~/components/ui/ProfileUI/FollowDialogUI/FollowersDialog";
import FollowingDialog from "~/components/ui/ProfileUI/FollowDialogUI/FollowingDialog";

const ProfilePage = ({ setAvatar }) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const { user } = useUser();
    const isOwner = user?.slug === profile?.slug;
    const [currentProfileId, setCurrentProfileId] = useState(null);
    const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
    const [followersList, setFollowersList] = useState([]);
    const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);
    const [followingList, setFollowingList] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // 1. Fetch current user profile nếu có user
                if (user?.username) {
                    const userProfile = await getProfileByUsername(
                        user.username
                    );
                    if (userProfile) {
                        setCurrentProfileId(userProfile._id);
                    }
                }

                // 2. Fetch profile chính
                const profileData = await getProfileBySlug(slug);
                setProfile(profileData);

                // 3. Kiểm tra trạng thái follow
                if (user && profileData?.followers) {
                    const isUserFollowing = profileData.followers.some(
                        (follower) =>
                            follower._id === user._id ||
                            follower._id === user.id ||
                            follower === user._id ||
                            follower === user.id
                    );
                    setIsFollowing(isUserFollowing);
                }
            } catch (err) {
                setError(err);
                setTimeout(() => navigate("/"), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [slug, navigate, user]);

    // Thêm hàm fetch followers
    const fetchFollowers = async () => {
        try {
            const followers = await getFollowers(profile._id);
            setFollowersList(followers);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách followers:", error);
        }
    };

    const handleOpenFollowers = async () => {
        await fetchFollowers();
        setIsFollowersDialogOpen(true);
    };

    const fetchFollowing = async () => {
        try {
            const following = await getFollowing(profile._id);
            setFollowingList(following);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách following:", error);
        }
    };

    // Hàm mở dialog following
    const handleOpenFollowing = async () => {
        await fetchFollowing();
        setIsFollowingDialogOpen(true);
    };

    // Hiển thị loading page hoàn toàn
    if (loading) {
        return (
            <div className=" min-h-screen flex items-center justify-center"></div>
        );
    }

    if (error) {
        return (
            <div className=" min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error.message}</p>
            </div>
        );
    }

    // Chỉ render giao diện khi tất cả dữ liệu đã sẵn sàng
    return (
        <div className=" min-h-screen flex flex-col items-center mt-3">
            <div className="max-w-4xl p-6 flex items-center space-x-8 mx-auto">
                {/* Avatar */}
                <div className="relative group">
                    <img
                        src={profile.avatar}
                        alt="Avatar"
                        className="w-32 h-32 mx-auto rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        onClick={
                            isOwner ? () => setIsAvatarModalOpen(true) : null
                        }
                    />
                </div>

                <div className="flex flex-col space-y-2 ml-10">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl max-w-80">
                            {profile.fullName}
                        </h1>
                        {isOwner ? (
                            <Link to="/account/edit-profile">
                                <button className="bg-[var(--button-color)] px-4 py-1 rounded-md cursor-pointer text-[14px]">
                                    Chỉnh sửa trang cá nhân
                                </button>
                            </Link>
                        ) : (
                            <>
                                {user && profile && (
                                    <FollowButton
                                        currentUserId={currentProfileId}
                                        profileId={profile._id}
                                        isFollowing={isFollowing}
                                        setIsFollowing={setIsFollowing}
                                    />
                                )}

                                {/* Nút Nhắn tin */}
                                <button className="bg-[var(--button-color)] hover:bg-[var(--secondary-color)] px-4 py-2 rounded-md cursor-pointer text-[14px]">
                                    Nhắn tin
                                </button>
                            </>
                        )}
                        {isOwner && <Settings className="cursor-pointer" />}
                    </div>
                    <div className="flex space-x-6 mt-4 text-[var(--text-secondary-color)]">
                        <span>
                            <strong className="text-[var(--text-primary-color)]">
                                {profile.posts?.length || 0}
                            </strong>{" "}
                            bài viết
                        </span>
                        <span
                            className="cursor-pointer"
                            onClick={handleOpenFollowers}
                        >
                            <strong className="text-[var(--text-primary-color)]">
                                {profile.followers?.length || 0}
                            </strong>{" "}
                            người theo dõi
                        </span>

                        <span
                            className="cursor-pointer"
                            onClick={handleOpenFollowing}
                        >
                            Đang theo dõi{" "}
                            <strong className="text-[var(--text-primary-color)]">
                                {profile.following?.length || 0}
                            </strong>{" "}
                            người dùng
                        </span>
                    </div>
                    <a href={profile.website} className="mt-4">
                        {profile.website}
                    </a>
                    <span className="">{profile.bio}</span>
                </div>
            </div>

            {/* Avatar Modal */}
            <AvatarSyncModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                avatar={profile.avatar}
                fullName={profile.fullName}
                profileSlug={profile.slug}
                onAvatarUpdated={(newAvatar) => {
                    setProfile((prev) => ({ ...prev, avatar: newAvatar }));
                    setAvatar(newAvatar);
                }}
            />

            {isFollowersDialogOpen && (
                <FollowersDialog
                    followers={followersList}
                    onClose={() => setIsFollowersDialogOpen(false)}
                    isOpen={isFollowersDialogOpen}
                />
            )}
            {isFollowingDialogOpen && (
                <FollowingDialog
                    following={followingList}
                    onClose={() => setIsFollowingDialogOpen(false)}
                    isOpen={isFollowingDialogOpen}
                />
            )}
        </div>
    );
};

export default ProfilePage;
