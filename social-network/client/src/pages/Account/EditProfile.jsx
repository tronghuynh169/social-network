import React, { useState, useEffect } from "react";
import { useUser } from "~/context/UserContext";
import { getProfileByUsername, updateProfileByUsername } from "~/api/profile";
import { Link as LinkIcon, Pencil, X, CirclePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState("");
    const [gender, setGender] = useState("Khác");
    const [originalProfile, setOriginalProfile] = useState(null);
    const [websites, setWebsites] = useState([""]);
    const [location, setLocation] = useState("");
    const [editingIndexes, setEditingIndexes] = useState([]); // ví dụ: [0, 2]

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileData = await getProfileByUsername(user.username);
                if (profileData) {
                    setProfile(profileData);
                    setOriginalProfile(profileData); // ✅ Lưu trạng thái ban đầu
                    setBio(profileData.bio || "");
                    setGender(profileData.gender || "Khác");
                    setLocation(profileData.location || "");

                    const initialWebsites = Array.isArray(profileData.website)
                        ? profileData.website
                        : profileData.website
                        ? [profileData.website]
                        : [""];
                    setWebsites(initialWebsites);
                }
            } catch (err) {
                console.error("❌ Lỗi khi lấy profile:", err);
            }
        };

        if (user?.username) {
            fetchProfileData();
        }
    }, [user?.username]);

    const handleEditClick = (index) => {
        setEditingIndexes((prev) => [...prev, index]);
    };

    const handleDoneEdit = (index) => {
        setEditingIndexes((prev) => prev.filter((i) => i !== index));
    };

    const handleWebsiteChange = (index, value) => {
        const updated = [...websites];
        updated[index] = value;
        setWebsites(updated);
    };

    const handleAddWebsite = () => {
        setWebsites([...websites, ""]);
        setEditingIndexes((prev) => [...prev, websites.length]);
    };

    const handleRemoveWebsite = (index) => {
        const updated = [...websites];
        updated.splice(index, 1);
        setWebsites(updated);
        setEditingIndexes((prev) => prev.filter((i) => i !== index));
    };

    const isChanged = () => {
        return (
            bio !== originalProfile?.bio ||
            gender !== originalProfile?.gender ||
            JSON.stringify(websites.filter(Boolean)) !==
                JSON.stringify(originalProfile?.website || []) ||
            location !== originalProfile?.location
        );
    };

    const handleSave = async () => {
        if (!isChanged()) return;

        try {
            const updatedProfile = {
                bio,
                gender,
                website: websites.filter((url) => url.trim() !== ""),
                location,
            };

            const response = await updateProfileByUsername(
                user.username,
                updatedProfile
            );

            setProfile(response); // Cập nhật state
            setOriginalProfile(response);

            navigate(`/${response.slug}`);
        } catch (err) {
            console.error("❌ Lỗi khi cập nhật profile:", err);
            alert("❌ Cập nhật thất bại!");
        }
    };

    if (!profile) {
        return <p>Đang tải dữ liệu...</p>;
    }

    return (
        <div className="h-screen overflow-y-auto flex flex-col items-center">
            <div className="w-[40%] p-6 flex flex-col mx-auto">
                {/* Tiêu đề */}
                <h2 className="text-2xl font-semibold mb-4">
                    Chỉnh sửa trang cá nhân
                </h2>

                {/* Avatar + Tên */}
                <div className="flex items-center space-x-4 bg-[var(--secondary-color)] p-4 rounded-lg mt-8">
                    {profile?.avatar ? (
                        <img
                            src={profile.avatar}
                            alt={profile.fullName}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-[var(--)]">No Image</span>
                        </div>
                    )}
                    <div className="flex-1 ml-1">
                        <p className="font-semibold">
                            {profile?.fullName || "Chưa có tên"}
                        </p>
                        <p className="text-[var(--text-secondary-color)] text-sm">
                            @{profile?.slug}
                        </p>
                    </div>
                </div>

                {/* Trang Web */}
                <div className="mt-8">
                    <label className="block mb-3 font-semibold">
                        Trang web
                    </label>

                    {websites.map((url, index) => {
                        const isEditing = editingIndexes.includes(index);
                        const isEmpty = !url.trim();

                        // ⚠️ Nếu rỗng và không đang chỉnh sửa, thì bỏ qua không render
                        if (isEmpty && !isEditing) return null;

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-2 mb-2 group"
                            >
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) =>
                                                handleWebsiteChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Địa chỉ trang web"
                                        />
                                        <button
                                            onClick={() =>
                                                handleDoneEdit(index)
                                            }
                                            className="text-sm text-[var(--text-primary-color)] hover:cursor-pointer"
                                        >
                                            Xong
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1 text-md text-[var(--text-primary-color)] flex items-center gap-2 p-4">
                                            <LinkIcon
                                                size={22}
                                                className="text-gray-500 mr-2"
                                            />
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                {url}
                                            </a>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleEditClick(index)
                                            }
                                            className="p-2 rounded-full overflow-hidden bg-[var(--text-primary-color)] hover:cursor-pointer"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil
                                                size={16}
                                                className="text-gray-500"
                                            />
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {/* Nút thêm */}
                    <button
                        type="button"
                        onClick={handleAddWebsite}
                        className="flex items-center p-4 text-[var(--text-primary-color)] mt-2 hover:underline cursor-pointer"
                    >
                        <CirclePlus size={24} className="mr-2" /> Thêm một trang
                        web
                    </button>
                </div>

                {/* Tiểu sử */}
                <div className="mt-4">
                    <label className="block mt-8 mb-3 font-semibold">
                        Tiểu sử
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={150}
                        className="w-full p-2 h-24 border-[1px] border-[var(--secondary-color)] rounded-md"
                        placeholder="Nhập tiểu sử"
                    ></textarea>
                    <p className="text-right text-sm">{bio.length} / 150</p>
                </div>

                {/* Địa chỉ */}
                <div className="mt-3">
                    <label className="block mb-3 font-semibold">Địa chỉ</label>
                    <input
                        type="text"
                        maxLength={100}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Nhập địa chỉ"
                        className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
                    />
                </div>

                {/* Giới tính */}
                <div className="mt-8">
                    <label className="block mb-3 font-semibold">
                        Giới tính
                    </label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full p-3 border-[1px] bg-[var(--secondary-color)] border-[var(--secondary-color)] rounded-md cursor-pointer"
                    >
                        <option value="Khác">Khác</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>
                </div>

                {/* Nút Lưu */}
                <div className="mt-6 text-end">
                    <button
                        className={`w-[40%] py-2 rounded-md font-semibold cursor-pointer ${
                            isChanged()
                                ? "bg-[var(--button-enable-color)] hover:bg-blue-500"
                                : "bg-[var(--button-disable-color)] cursor-not-allowed"
                        }`}
                        disabled={!isChanged()}
                        onClick={handleSave}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
