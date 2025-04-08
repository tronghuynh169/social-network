import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import unidecode from "unidecode";
import { unfollowUser, followUser } from "~/api/profile";
import { useUser } from "~/context/UserContext";

const FollowingDialog = ({ following, onClose }) => {
    const { profile } = useUser();
    const [followStatus, setFollowStatus] = useState({});
    const [actionLoadingMap, setActionLoadingMap] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [localFollowing, setLocalFollowing] = useState(following);
    const [confirmUnfollow, setConfirmUnfollow] = useState({
        show: false,
        userId: null,
        fullName: "",
        avatar: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        const initialFollowStatus = {};
        following.forEach((user) => {
            initialFollowStatus[user._id] = true;
        });
        setFollowStatus(initialFollowStatus);
        setLocalFollowing(following);
    }, [following]);

    const handleNavigate = (slug) => {
        navigate(`/${slug}`);
        onClose();
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredFollowing = localFollowing.filter((user) =>
        unidecode(user.fullName)
            .toLowerCase()
            .includes(unidecode(searchQuery).toLowerCase())
    );

    const handleFollowToggle = async (userId) => {
        if (!profile?._id || actionLoadingMap[userId]) return;

        if (followStatus[userId]) {
            const user = localFollowing.find((u) => u._id === userId);
            if (user) {
                setConfirmUnfollow({
                    show: true,
                    userId,
                    fullName: user.fullName,
                    avatar: user.avatar,
                });
            }
            return;
        }

        await performFollow(userId);
    };

    const performUnfollow = async (userId) => {
        setActionLoadingMap((prev) => ({ ...prev, [userId]: true }));
        try {
            setFollowStatus((prev) => ({ ...prev, [userId]: false }));
            await unfollowUser(userId, profile._id);
        } catch (error) {
            console.error("Error:", error);
            setFollowStatus((prev) => ({ ...prev, [userId]: true }));
        } finally {
            setActionLoadingMap((prev) => ({ ...prev, [userId]: false }));
            setConfirmUnfollow({
                show: false,
                userId: null,
                fullName: "",
                avatar: "",
            });
        }
    };

    const performFollow = async (userId) => {
        setActionLoadingMap((prev) => ({ ...prev, [userId]: true }));
        try {
            setFollowStatus((prev) => ({ ...prev, [userId]: true }));
            await followUser(profile._id, userId);
            const userToAdd =
                localFollowing.find((u) => u._id === userId) ||
                following.find((u) => u._id === userId);

            if (
                userToAdd &&
                !localFollowing.some((u) => u._id === userToAdd._id)
            ) {
                setLocalFollowing((prev) => [...prev, userToAdd]);
            }
        } catch (error) {
            console.error("Error:", error);
            setFollowStatus((prev) => ({ ...prev, [userId]: false }));
        } finally {
            setActionLoadingMap((prev) => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay transition-opacity duration-300 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
                <motion.div
                    className="bg-[var(--secondary-color)] rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 120 },
                    }}
                    exit={{
                        scale: 0.9,
                        opacity: 0,
                        transition: { duration: 0.2 },
                    }}
                >
                    {/* Header */}
                    <div>
                        <div className="flex justify-end items-center p-2 text-[16px] border-b border-[var(--button-color)]">
                            <h2 className="mx-auto font-bold">Đang theo dõi</h2>
                            <button
                                onClick={onClose}
                                className="cursor-pointer"
                            >
                                <X />
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="mt-2 mx-4 relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm"
                                className="w-full h-[32px] bg-[var(--button-color)] rounded-md py-2 px-4 pl-10 focus:outline-none"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary-color)]"
                                size={18}
                            />
                        </div>
                    </div>

                    {/* Following list */}
                    <div className="overflow-y-auto max-h-[60vh]">
                        {filteredFollowing.length > 0 ? (
                            filteredFollowing.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-4"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            {user.avatar && (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p
                                                className="font-medium cursor-pointer max-w-[250px]"
                                                onClick={() =>
                                                    handleNavigate(user.slug)
                                                }
                                            >
                                                {user.fullName}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleFollowToggle(user._id);
                                        }}
                                        className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-lg ${
                                            followStatus[user._id]
                                                ? "bg-[var(--button-secondary-color)] hover:bg-[var(--button-color)]"
                                                : "bg-[var(--button-enable-color)] hover:bg-blue-500"
                                        }`}
                                        disabled={actionLoadingMap[user._id]}
                                    >
                                        {actionLoadingMap[user._id]
                                            ? "Đang xử lý..."
                                            : followStatus[user._id]
                                            ? "Bỏ theo dõi"
                                            : "Theo dõi"}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-[var(--text-secondary-color)] py-4">
                                Không tìm thấy người dùng nào.
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Confirm unfollow modal */}
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
                                onClick={() =>
                                    performUnfollow(confirmUnfollow.userId)
                                }
                                className="py-3 px-8 cursor-pointer text-[var(--text-button-color)] font-bold border-t border-[var(--button-color)]"
                                disabled={
                                    actionLoadingMap[confirmUnfollow.userId]
                                }
                            >
                                {actionLoadingMap[confirmUnfollow.userId]
                                    ? "Đang xử lý..."
                                    : "Bỏ theo dõi"}
                            </button>
                            <button
                                onClick={() =>
                                    setConfirmUnfollow({
                                        show: false,
                                        userId: null,
                                        fullName: "",
                                        avatar: "",
                                    })
                                }
                                className="py-3 px-8 cursor-pointer border-t border-[var(--button-color)]"
                            >
                                Hủy
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FollowingDialog;
