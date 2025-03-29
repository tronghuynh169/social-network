import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileBySlug } from "~/api/profile"; // ✅ Đổi sang dùng slug
import { Settings } from "lucide-react";
import AvatarModal from "~/components/ui/AvatarModal";

const ProfilePage = () => {
    const { slug } = useParams(); // 🔥 Đổi từ username → slug
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileBySlug(slug); // ✅ Gọi API bằng slug
                setProfile(data);
            } catch (err) {
                setError(err);
                setTimeout(() => navigate("/"), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [slug, navigate]);

    if (loading) return <p className="text-white">Đang tải...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center mt-3">
            <div className="w-full max-w-4xl p-6 flex items-center space-x-8">
                {/* ✅ Avatar - Bấm để mở modal */}
                <div className="relative group">
                    <img
                        src={
                            profile.avatar || "https://via.placeholder.com/150"
                        }
                        alt="Avatar"
                        className="w-32 h-32 rounded-full border-4 border-gray-700 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        onClick={() => setIsOpen(true)}
                    />
                    {/* Tooltip */}
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Xem ảnh đại diện
                    </span>
                </div>

                <div className="flex flex-col space-y-2 ml-10">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl">{profile.fullName}</h1>
                        <button className="bg-gray-800 px-4 py-2 rounded-md">
                            Chỉnh sửa trang cá nhân
                        </button>
                        <Settings className="cursor-pointer" />
                    </div>
                    <div className="flex space-x-6 mt-4">
                        <span>
                            <strong>{profile.posts || 0}</strong> bài viết
                        </span>
                        <span>
                            <strong>{profile.followers || 0}</strong> người theo
                            dõi
                        </span>
                        <span>
                            Đang theo dõi{" "}
                            <strong>{profile.following || 0}</strong> người dùng
                        </span>
                    </div>
                    <span className="font-semibold mt-4">{profile.bio}</span>
                </div>
            </div>
            {/* ✅ Thêm AvatarModal vào đây */}
            <AvatarModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                avatar={profile.avatar}
            />
        </div>
    );
};

export default ProfilePage;
