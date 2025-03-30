import { createContext, useContext, useState, useEffect } from "react";
import { getProfileByUsername } from "~/api/profile";

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(
        () => JSON.parse(localStorage.getItem("user")) || null
    );
    const [profile, setProfile] = useState(null);
    const [avatar, setAvatar] = useState("/default-avatar.png");

    useEffect(() => {
        if (user) {
            fetchProfile(user.username);
        }
    }, [user]);

    const fetchProfile = async (username) => {
        const profileData = await getProfileByUsername(username);
        if (profileData) {
            setProfile(profileData);
            setAvatar(profileData.avatar || "/default-avatar.png");
            localStorage.setItem("profile", JSON.stringify(profileData));
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
