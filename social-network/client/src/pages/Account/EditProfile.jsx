import React, { useState, useEffect } from "react";
import { useUser } from "~/context/UserContext";
import { getProfileByUsername, updateProfileByUsername } from "~/api/profile";

const EditProfile = () => {
    const { user } = useUser();
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState("");
    const [gender, setGender] = useState("Khác");
    const [originalProfile, setOriginalProfile] = useState(null);
    const [website, setWebsite] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileData = await getProfileByUsername(user.username);
                if (profileData) {
                    setProfile(profileData);
                    setOriginalProfile(profileData); // ✅ Lưu trạng thái ban đầu
                    setBio(profileData.bio || "");
                    setGender(profileData.gender || "Khác");
                    setWebsite(profileData.website || "");
                    setLocation(profileData.location || "");
                }
            } catch (err) {
                console.error("❌ Lỗi khi lấy profile:", err);
            }
        };

        if (user?.username) {
            fetchProfileData();
        }
    }, [user?.username]);

    const isChanged = () => {
        return (
            bio !== originalProfile?.bio ||
            gender !== originalProfile?.gender ||
            website !== originalProfile?.website ||
            location !== originalProfile?.location
        );
    };

    const handleSave = async () => {
        if (!isChanged()) return;

        try {
            const updatedProfile = {
                bio,
                gender,
                website,
                location,
            };

            console.log(
                "🚀 Dữ liệu sẽ gửi đi:",
                JSON.stringify(updatedProfile)
            ); // Log dữ liệu trước khi gửi

            const response = await updateProfileByUsername(
                user.username,
                updatedProfile
            );

            console.log("✅ API phản hồi dữ liệu mới:", response);

            setProfile(response); // Cập nhật state
            setOriginalProfile(response);

            alert("✅ Cập nhật thành công!");
        } catch (err) {
            console.error("❌ Lỗi khi cập nhật profile:", err);
            alert("❌ Cập nhật thất bại!");
        }
    };

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
            <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Trang web"
                className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
            />

            {/* Địa chỉ */}
            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nhập địa chỉ"
                className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
            />

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
                <button
                    className={`w-[40%] py-2 rounded-md rounded-2xl font-semibold cursor-pointer ${
                        isChanged()
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isChanged()}
                    onClick={handleSave}
                >
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
