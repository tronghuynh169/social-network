import React, { useState, useEffect } from "react";
import { useUser } from "~/context/UserContext";
import { getProfileByUsername } from "~/api/profile";

const EditProfile = () => {
    const { user } = useUser();
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState("");
    const [gender, setGender] = useState("Khác");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileData = await getProfileByUsername(user.username);

                if (profileData) {
                    setProfile(profileData);
                    setBio(profileData.bio || ""); // Gán dữ liệu từ API vào state
                    setGender(profileData.gender || "Khác");
                } else {
                    console.warn("⚠ API không trả về dữ liệu!");
                }
            } catch (err) {
                console.error("❌ Lỗi khi lấy profile:", err);
            }
        };

        if (user?.username) {
            fetchProfileData();
        } else {
            console.warn("⚠ user.username không tồn tại!");
        }
    }, [user?.username]);

    if (!profile) {
        return <p>Đang tải dữ liệu...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 rounded-lg mt-3">
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
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">
                    Trang web cá nhân
                </label>
                <input
                    type="text"
                    value={profile?.website || ""}
                    placeholder="Trang web"
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
                />
            </div>

            {/* Địa chỉ */}
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">Địa chỉ</label>
                <input
                    type="text"
                    value={profile?.location || ""}
                    placeholder="Nhập địa chỉ"
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
                />
            </div>

            {/* Tiểu sử */}
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">Tiểu sử</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={150}
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
                    placeholder="Nhập tiểu sử"
                ></textarea>
                <p className="text-right text-sm">{bio.length} / 150</p>
            </div>

            {/* Giới tính */}
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">
                    Giới tính
                </label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md cursor-pointer"
                >
                    <option value="Khác">Khác</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                </select>
            </div>

            {/* Nút Lưu */}
            <div className="mt-6 text-end">
                <button className="w-[40%] bg-blue-500 py-2 rounded-md rounded-2xl font-semibold hover:bg-blue-600 cursor-pointer">
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
