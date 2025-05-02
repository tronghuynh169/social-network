import React from "react";

const SeenAvatars = ({ users, hasLikes, isMe }) => {
    if (!users?.length) return null;
    return (
        <div
            className={`absolute flex gap-1 items-center ${
                hasLikes && users.length > 0 ? "-bottom-10" : "-bottom-6"
            } ${isMe ? "right-0" : "left-0"}`}
        >
            {users.slice(0, 3).map((user, i) => (
                <img
                    key={i}
                    src={user.avatar}
                    alt={user.fullName}
                    title={user.fullName}
                    className="w-5 h-5 rounded-full border border-white shadow-sm"
                />
            ))}
            {users.length > 3 && (
                <div
                    className="w-5 h-5 rounded-full bg-gray-300 text-xs flex items-center justify-center border border-white shadow-sm"
                    title={users
                        .slice(3)
                        .map((u) => u.fullName)
                        .join(", ")}
                >
                    +{users.length - 3}
                </div>
            )}
        </div>
    );
};

export default SeenAvatars;
