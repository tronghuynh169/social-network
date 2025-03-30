import { useState, useEffect } from "react";
import SideBar from "../SideBar";
import { getProfileBySlug } from "~/api/profile";
import { useParams } from "react-router-dom";
import ProfilePage from "~/pages/ProfilePage/ProfilePage";

function DefaultLayout({ children }) {
    const [avatar, setAvatar] = useState(null);
    const { slug } = useParams();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getProfileBySlug(slug);
                if (profile) {
                    setAvatar(profile.avatar); // Luôn cập nhật khi slug thay đổi
                }
            } catch (err) {
                console.error("Lỗi khi lấy avatar:", err);
            }
        };

        if (slug) fetchProfile();
    }, [slug]);

    return (
        <div className="flex min-h-screen">
            <div className="w-1/6 border-r border-[var(--secondary-color)] border-opacity-10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.2)]">
                <SideBar avatar={avatar} />
            </div>

            <div className="w-5/6 px-4 max-w-[1200px] mx-auto flex-grow">
                {/* ✅ Chỉ render children HOẶC ProfilePage, không render cả hai */}
                {slug ? <ProfilePage setAvatar={setAvatar} /> : children}
            </div>
        </div>
    );
}

export default DefaultLayout;
