import { createContext, useContext, useState, useEffect } from "react";
import { getProfileByUsername } from "~/api/profile";

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    const [profile, setProfile] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("profile")) || null;
        } catch {
            return null;
        }
    });
    const [avatar, setAvatar] = useState(
        profile?.avatar || "/default-avatar.png"
    );

    useEffect(() => {
        if (user) {
            fetchProfile(user.username);
        }
    }, [user]);

    const fetchProfile = async (username) => {
        try {
            const profileData = await getProfileByUsername(username);
            if (profileData) {
                setProfile(profileData);
                setAvatar(profileData.avatar || "/default-avatar.png");
                localStorage.setItem("profile", JSON.stringify(profileData));
            }
        } catch (error) {
            console.error("Lỗi khi lấy profile:", error);
        }
    };

    // Hàm cập nhật avatar ngay lập tức
    const updateAvatar = (newAvatar) => {
        setAvatar(newAvatar);
        setProfile((prevProfile) => ({
            ...prevProfile,
            avatar: newAvatar,
        }));
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                avatar,
                setAvatar,
                profile,
                setProfile,
                fetchProfile,
                updateAvatar,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
