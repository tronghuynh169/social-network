import { useState, useEffect, memo } from "react";
import SideBar from "../SideBar";
import { getProfileBySlug } from "~/api/profile";
import { useParams } from "react-router-dom";
import ProfilePage from "~/pages/ProfilePage/ProfilePage";

const DefaultLayout = memo(({ children }) => {
    const [avatar, setAvatar] = useState(null);
    const { slug } = useParams();

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            try {
                const profile = await getProfileBySlug(slug);
                if (profile && isMounted && profile.avatar !== avatar) {
                    setAvatar(profile.avatar);
                }
            } catch (err) {
                console.error("Lỗi khi lấy avatar:", err);
            }
        };
        if (slug) fetchProfile();
        return () => {
            isMounted = false;
        };
    }, [slug, avatar]);

    return (
        <div className="flex min-h-screen">
            <div className="w-[14.4%] border-r border-[#262626] border-opacity-10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.2)]">
                <SideBar />
            </div>

            <div className="w-[85.6] flex-grow">
                {slug ? <ProfilePage setAvatar={setAvatar} /> : children}
            </div>
        </div>
    );
});

export default DefaultLayout;
