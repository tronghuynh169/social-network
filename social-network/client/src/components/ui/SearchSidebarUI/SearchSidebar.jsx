import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { getProfileByFullName, checkFollowingStatus } from "~/api/profile";
import { useUser } from "~/context/UserContext";
import { useNavigate  } from "react-router-dom";

const SearchBar = () => {
    const { user, profile } = useUser();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [followingStatus, setFollowingStatus] = useState({});
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);
    const searchTimer = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (query.trim() === "") {
            setResults([]);
            setIsDropdownOpen(false);
            setError(null);
            return;
        }

        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(async () => {
            try {
                const profiles = await getProfileByFullName(query);
                setResults(profiles || []);
                setIsDropdownOpen(profiles?.length > 0);

                // Kiểm tra xem user có tồn tại và danh sách profiles có dữ liệu
                if (user && profiles.length > 0) {
                    const followStatuses = await Promise.all(
                        profiles.map((profilesearch) =>
                            checkFollowingStatus(profilesearch._id, profile._id) // Truyền profile._id và user._id
                                .then((res) => ({
                                    id: profile._id,
                                    isFollowing: res.isFollowing,
                                }))
                                .catch((error) => {
                                    console.error(
                                        `Lỗi khi kiểm tra follow ${profile._id}:`,
                                        error
                                    );
                                    return {
                                        id: profile._id,
                                        isFollowing: false,
                                    };
                                })
                        )
                    );

                    // Chuyển danh sách về object { profileId: isFollowing }
                    const statusMap = followStatuses.reduce(
                        (acc, { id, isFollowing }) => {
                            acc[id] = isFollowing;
                            return acc;
                        },
                        {}
                    );
                    setFollowingStatus(statusMap);
                } else {
                    setResults([]);
                    setIsDropdownOpen(false);
                    setError("Không có kết quả tìm kiếm.");
                }
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(searchTimer.current);
    }, [query, user]);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Xử lý khi nhấp vào kết quả tìm kiếm
    const handleResultClick = (slug) => {
        setIsDropdownOpen(false); 
        setQuery(""); 
        navigate(`/${slug}`); // Chuyển hướng tới đường dẫn mới
    };

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Ô tìm kiếm */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className={`w-full bg-[var(--secondary-color)] px-4 py-2 pl-10 focus:outline-none shadow-md transition-all ${
                        isDropdownOpen ? "rounded-t-xl" : "rounded-xl"
                    }`}
                />
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary-color)]"
                    size={18}
                />
            </div>

            {/* Dropdown kết quả */}
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 bg-[var(--secondary-color)] shadow-lg z-10 overflow-hidden rounded-b-xl"
                >
                    <ul className="overflow-auto my-2">
                        {results.map((profilesearch) => (
                            <li
                                key={profilesearch._id}
                                className="flex items-center gap-3 p-2 mx-auto w-[93%] cursor-pointer rounded-lg hover:bg-[var(--button-color)] transition-all"
                                onClick={() => handleResultClick(profilesearch.slug)} // Thêm sự kiện onClick
                            >
                                <img
                                    src={
                                        profilesearch.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium">
                                        {profilesearch.fullName}
                                    </p>
                                    {followingStatus[profile._id] && (
                                        <p className="text-[13px] text-[var(--text-secondary-color)]">
                                            • Đang theo dõi
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Hiển thị thông báo lỗi nếu không tìm thấy */}
            {error && !isDropdownOpen && (
                <p className="text-center text-sm text-red-500 mt-2">{error}</p>
            )}
        </div>
    );
};

export default SearchBar;
