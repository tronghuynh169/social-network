import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPostLikes } from "~/api/post";
import {
    getProfileByUserId,
    getFollowing,
    followUser,
    unfollowUser,
} from "~/api/profile";
import { useNavigate } from "react-router-dom";

const LikesModal = ({ postId, currentUserId, onClose }) => {
    const navigate = useNavigate(); 
    const [likesUsers, setLikesUsers] = useState([]);
    const [followingList, setFollowingList] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [followingLoading, setFollowingLoading] = useState({});
    const [currentProfileId, setCurrentProfileId] = useState(null);

    const modalRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: postData } = await getPostLikes(postId);
                console.log(postData);
                const currentUserProfile = await getProfileByUserId(
                    currentUserId
                );
                setCurrentProfileId(currentUserProfile._id);
                const followingData = await getFollowing(
                    currentUserProfile._id
                );
                const followingUserIds = new Set(
                    followingData.map((profile) => profile.userId)
                );

                const followingMap = new Map();
                followingData.forEach((profile) => {
                    followingMap.set(profile.userId, profile);
                });

                const mergedLikesUsers = await Promise.all(
                    postData.likes.map(async (likeUser) => {
                        let profile;
                        if (followingMap.has(likeUser._id)) {
                            profile = followingMap.get(likeUser._id);
                        } else {
                            try {
                                profile = await getProfileByUserId(
                                    likeUser._id
                                );
                            } catch (error) {
                                console.error("Lỗi khi lấy profile:", error);
                                profile = { ...likeUser };
                            }
                        }
                        if (!profile.userId) profile.userId = likeUser._id;
                        return profile;
                    })
                );

                const sortedUsers = mergedLikesUsers.sort((a, b) => {
                    const aIsFollowing = followingUserIds.has(a.userId);
                    const bIsFollowing = followingUserIds.has(b.userId);
                    const aIsSelf = a.userId === currentUserId;
                    const bIsSelf = b.userId === currentUserId;

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

    const handleFollowToggle = async (targetProfileId) => {
        setFollowingLoading((prev) => ({ ...prev, [targetProfileId]: true }));
        try {
            const updatedSet = new Set(followingList);
            const targetUser = likesUsers.find(
                (user) => user._id === targetProfileId
            );
            const targetUserId = targetUser?.userId;

            if (!targetUserId) return;

            if (updatedSet.has(targetUserId)) {
                await unfollowUser(targetProfileId, currentProfileId);
                updatedSet.delete(targetUserId);
            } else {
                await followUser(currentProfileId, targetProfileId);
                updatedSet.add(targetUserId);
            }

            setFollowingList(updatedSet);

            setLikesUsers((prev) =>
                [...prev].sort((a, b) => {
                    const aIsFollowing = updatedSet.has(a.userId);
                    const bIsFollowing = updatedSet.has(b.userId);
                    const aIsSelf = a.userId === currentUserId;
                    const bIsSelf = b.userId === currentUserId;

                    if (aIsSelf) return 1;
                    if (bIsSelf) return -1;
                    if (aIsFollowing === bIsFollowing) return 0;
                    return aIsFollowing ? -1 : 1;
                })
            );
        } catch (error) {
            console.error("Lỗi theo dõi:", error);
        } finally {
            setFollowingLoading((prev) => ({
                ...prev,
                [targetProfileId]: false,
            }));
        }
    };

    const handleGoToProfile = (slug) => {
        navigate(`/${slug}`, { replace: false });
      };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    ref={modalRef}
                    className="bg-[var(--secondary-color)] text-white w-[400px] max-h-[80vh] rounded-xl overflow-hidden shadow-2xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {console.log(likesUsers)}
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-1 border-b border-neutral-700">
                        <div className="flex-1 text-center">
                            <h3 className="text-md font-bold">Lượt thích</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-3xl text-neutral-400 hover:text-white cursor-pointer"
                        >
                            &times;
                        </button>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-[65vh]">
                        {loading ? (
                            <div className="text-center py-6 text-neutral-400">
                                Đang tải...
                            </div>
                        ) : likesUsers.length === 0 ? (
                            <div className="text-center py-6 text-neutral-400">
                                Chưa có lượt thích nào
                            </div>
                        ) : (
                            likesUsers.map((user) => {
                                const isMe = user.userId === currentUserId;
                                const isFollowing = followingList.has(
                                    user.userId
                                );

                                return (
                                    <div
                                        key={user.userId}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-neutral-800 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    user.avatar ||
                                                    "/default-avatar.png"
                                                }
                                                alt={user.fullName}
                                                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90"
                                                onClick={() => handleGoToProfile(user.slug)}
                                            />
                                            <div>
                                                {user.fullName && (
                                                    <p className="text-[var(--text-primary-color)]-400 text-sm cursor-pointer"
                                                     onClick={() => handleGoToProfile(user.slug)}>
                                                        {user.fullName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {!isMe && (
                                            <button
                                                onClick={() =>
                                                    handleFollowToggle(user._id)
                                                }
                                                disabled={
                                                    followingLoading[
                                                        user.userId
                                                    ]
                                                }
                                                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                                    isFollowing
                                                        ? "bg-[var(--button-color)] text-white hover:bg-[var(--button-color)]/50"
                                                        : "bg-[var(--button-enable-color)] text-white hover:bg-[var(--button-enable-color)]/80"
                                                }`}
                                            >
                                                {followingLoading[user.userId]
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LikesModal;
