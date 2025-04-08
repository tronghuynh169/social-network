import React, { useState, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import unidecode from "unidecode";
import { getFollowing } from "~/api/profile";

const SearchFriendModal = ({ open, onClose, profileId, onSelect }) => {
    const [searchValue, setSearchValue] = useState("");
    const [allFriends, setAllFriends] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (open && profileId) {
            (async () => {
                try {
                    const res = await getFollowing(profileId);
                    setAllFriends(res);
                    setResults(res);
                } catch (error) {
                    console.error("Lỗi khi lấy danh sách theo dõi:", error);
                }
            })();
        }
    }, [open, profileId]);

    useEffect(() => {
        if (!open) {
            setSearchValue("");
            setSelectedUsers([]);
        }
    }, [open]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        const keyword = unidecode(value.trim().toLowerCase());
        const filtered = allFriends.filter((user) =>
            unidecode(user.fullName || "")
                .toLowerCase()
                .includes(keyword)
        );
        setResults(filtered);
    };

    const toggleSelect = (user) => {
        const exists = selectedUsers.find((u) => u._id === user._id);
        if (exists) {
            setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
        } else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[var(--secondary-color)] rounded-lg w-[90%] max-w-md max-h-[80vh] p-4 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--button-color)] pb-2 mb-3">
                    <h2 className="text-lg font-semibold mx-auto">
                        Tin nhắn mới
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white"
                    >
                        <X />
                    </button>
                </div>

                {/* Selected users */}
                {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selectedUsers.map((user) => (
                            <span
                                key={user._id}
                                className="bg-[var(--bg-message-color)] text-[var(--button-enable-color)] font-[550] text-sm pl-4 pr-2 py-1 rounded-full flex items-center gap-1"
                            >
                                {user.fullName}
                                <button
                                    onClick={() => toggleSelect(user)}
                                    className="text-xs cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Search input */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder="Nhập tên bạn muốn tìm..."
                        className="w-full h-[36px] bg-[var(--button-color)] rounded-md py-2 px-4 pl-10 focus:outline-none"
                    />
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary-color)]"
                        size={18}
                    />
                </div>

                {/* Danh sách kết quả tìm kiếm */}
                <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1 scroll-smooth custom-scrollbar">
                    {results.length > 0 ? (
                        results.map((user) => {
                            const isChecked = selectedUsers.some(
                                (u) => u._id === user._id
                            );
                            return (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-2 rounded hover:bg-[var(--button-color)] cursor-pointer"
                                    onClick={() => toggleSelect(user)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full overflow-hidden">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="bg-gray-500 w-full h-full" />
                                            )}
                                        </div>
                                        <p className="text-sm font-medium max-w-[180px] truncate">
                                            {user.fullName}
                                        </p>
                                    </div>

                                    {/* Nút tích kiểu Instagram */}
                                    <div
                                        className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 
                        ${
                            isChecked
                                ? "bg-[var(--text-primary-color)] border-[var(--text-primary-color)]"
                                : "border-gray-400"
                        }`}
                                    >
                                        {isChecked && (
                                            <Check className="w-4 h-4 text-[var(--primary-color)]" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-sm text-gray-400 py-4">
                            Không tìm thấy ai.
                        </p>
                    )}
                </div>

                {/* Nút Chat */}
                <div className="pt-4">
                    <button
                        disabled={selectedUsers.length === 0}
                        className={`w-full h-11 rounded-lg text-sm font-semibold shadow-md transition 
                        ${
                            selectedUsers.length === 0
                                ? "bg-[var(--button-disable-chat-color)] cursor-not-allowed"
                                : "bg-[var(--button-enable-color)] hover:bg-opacity-90 active:scale-95"
                        }`}
                        onClick={() => {
                            onSelect?.(selectedUsers);
                            onClose();
                        }}
                    >
                        Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchFriendModal;
