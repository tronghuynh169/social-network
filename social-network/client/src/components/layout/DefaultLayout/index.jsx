import { useState, useEffect, memo, useCallback } from "react";
import SideBar from "../SideBar";
import { getProfileBySlug } from "~/api/profile";
import { useParams } from "react-router-dom";
import ProfilePage from "~/pages/ProfilePage/ProfilePage";

const DefaultLayout = memo(({ children }) => {
    const [avatar, setAvatar] = useState(null);
    const { slug } = useParams();
    const [isBorderHidden, setIsBorderHidden] = useState(false);

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

    const handleSearchToggle = useCallback((isOpen) => {
        setIsBorderHidden(isOpen);
    }, []);

    return (
        <div className="flex min-h-screen">
            <div
                className={`relative w-1/6 transition-all duration-500 ease-in-out 
        after:content-[''] after:absolute after:right-0 after:top-0 
        after:h-full after:w-px after:bg-[var(--secondary-color)] 
        after:bg-opacity-10 after:transition-all after:duration-500 
        after:ease-in-out ${
            isBorderHidden ? "after:opacity-0" : "after:opacity-100"
        }`}
            >
                <SideBar avatar={avatar} onSearchToggle={handleSearchToggle} />
            </div>

            <div className="w-5/6 px-4 max-w-[1200px] mx-auto flex-grow">
                {slug ? <ProfilePage setAvatar={setAvatar} /> : children}
            </div>
        </div>
    );
});

export default DefaultLayout;
