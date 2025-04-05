import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import unidecode from "unidecode"; // Import unidecode

const FollowersDialog = ({ followers, onUnfollow, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleNavigate = (slug) => {
        navigate(`/${slug}`);
        onClose();
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Hàm lọc followers không dấu
    const filteredFollowers = followers.filter((user) =>
        unidecode(user.fullName)
            .toLowerCase()
            .includes(unidecode(searchQuery).toLowerCase())
    );

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
                            <h2 className="mx-auto font-bold">
                                Người theo dõi
                            </h2>
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

                    {/* Followers list */}
                    <div className="overflow-y-auto max-h-[60vh]">
                        {filteredFollowers.length > 0 ? (
                            filteredFollowers.map((user) => (
                                <div
                                    key={user.id}
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
                                            {/* Khi nhấn vào tên sẽ điều hướng đến /slug */}
                                            <p
                                                className="font-medium cursor-pointer"
                                                onClick={() =>
                                                    handleNavigate(user.slug)
                                                }
                                            >
                                                {user.fullName}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onUnfollow(user.id)}
                                        className="px-4 py-2 bg-[var(--button-secondary-color)] hover:bg-[var(--button-color)] text-sm font-medium cursor-pointer rounded-lg"
                                    >
                                        Xóa
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
        </AnimatePresence>
    );
};

export default FollowersDialog;
