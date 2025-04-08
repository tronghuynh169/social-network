import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import unidecode from "unidecode";
import { unfollowUser, followUser } from "~/api/profile";
import { useUser } from "~/context/UserContext";

const FollowersDialog = ({ followers, onClose }) => {
    const { profile } = useUser();
    const [followStatus, setFollowStatus] = useState({});
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [localFollowers, setLocalFollowers] = useState(followers);
    const [confirmUnfollow, setConfirmUnfollow] = useState({
        show: false,
        userId: null,
        fullName: "",
        avatar: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        const initialFollowStatus = {};
        followers.forEach((user) => {
            initialFollowStatus[user._id] = true; // Mặc định đang follow lại họ
        });
        setFollowStatus(initialFollowStatus);
        setLocalFollowers(followers);
    }, [followers]);

    const handleNavigate = (slug) => {
        navigate(`/${slug}`);
        onClose();
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredFollowers = localFollowers.filter((user) =>
        unidecode(user.fullName)
            .toLowerCase()
            .includes(unidecode(searchQuery).toLowerCase())
    );

    const handleFollowToggle = async (userId) => {
        if (!profile?._id || actionLoading) return;

        if (followStatus[userId]) {
            const user = localFollowers.find((u) => u._id === userId);
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
    };

    const performUnfollow = async (userId) => {
        setActionLoading(true);
        try {
            setFollowStatus((prev) => ({ ...prev, [userId]: false }));
            await unfollowUser(profile._id, userId);
        } catch (error) {
            console.error("Unfollow error:", error);
            setFollowStatus((prev) => ({ ...prev, [userId]: true }));
        } finally {
            setActionLoading(false);
            setConfirmUnfollow({
                show: false,
                userId: null,
                fullName: "",
                avatar: "",
            });
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-[var(--secondary-color)] rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    {/* Header */}
                    <div className="flex justify-end items-center p-2 text-[16px] border-b border-[var(--button-color)]">
                        <h2 className="mx-auto font-bold">Người theo dõi</h2>
                        <button onClick={onClose} className="cursor-pointer">
                            <X />
                        </button>
                    </div>

                    {/* Search */}
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

                    {/* List */}
                    <div className="overflow-y-auto max-h-[60vh]">
                        {filteredFollowers.length > 0 ? (
                            filteredFollowers.map((user) => (
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
                                        <p
                                            className="font-medium cursor-pointer max-w-[250px]"
                                            onClick={() =>
                                                handleNavigate(user.slug)
                                            }
                                        >
                                            {user.fullName}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleFollowToggle(user._id)
                                        }
                                        className={`px-4 py-2 text-sm font-medium cursor-pointer rounded-lg ${
                                            followStatus[user._id]
                                                ? "bg-[var(--button-secondary-color)] hover:bg-[var(--button-color)]"
                                                : "bg-[var(--button-color)] cursor-not-allowed opacity-60"
                                        }`}
                                        disabled={
                                            !followStatus[user._id] ||
                                            actionLoading
                                        }
                                    >
                                        {actionLoading &&
                                        confirmUnfollow.userId === user._id
                                            ? "Đang thực hiện..."
                                            : followStatus[user._id]
                                            ? "Xoá"
                                            : "Đã xóa"}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-[var(--text-secondary-color)] py-4">
                                Bạn chưa có người theo dõi.
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Confirm Unfollow */}
            {confirmUnfollow.show && (
                <motion.div
                    className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50"
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
                            className="w-[90px] h-[90px] rounded-full mx-auto mt-7"
                        />
                        <h3 className="text-2xl font-bold mt-5">
                            Xóa người theo dõi?
                        </h3>
                        <p className="text-[14px] mt-2 mb-5 w-[80%] mx-auto">
                            Instagram sẽ không cho {confirmUnfollow.fullName}{" "}
                            biết rằng bạn đã xóa họ khỏi danh sách người theo
                            dõi mình.
                        </p>
                        <div className="flex flex-col text-[14px]">
                            <button
                                onClick={() =>
                                    performUnfollow(confirmUnfollow.userId)
                                }
                                className="py-3 px-8 cursor-pointer text-[var(--text-button-color)] font-bold border-t border-[var(--button-color)]"
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Đang xử lý..." : "Xóa"}
                            </button>
                            <button
                                onClick={() =>
                                    setConfirmUnfollow({
                                        show: false,
                                        userId: null,
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

export default FollowersDialog;
