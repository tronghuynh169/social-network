import React from "react";
import { Link } from "react-router-dom";

const MemberPopover = ({ member, myProfileId, admin, isGroup }) => {
    return (
        <div className="absolute right-1 -bottom-1 mt-2 w-40 bg-[var(--secondary-color)] shadow-lg rounded-md py-2 z-50">
            <Link
                to={`/${member.slug}`}
                className="text-xs px-4 py-3 hover:bg-[var(--button-color)] cursor-pointer block"
            >
                Xem trang cá nhân
            </Link>
            {isGroup && myProfileId === admin._id && (
                <div className="text-xs px-4 py-3 hover:bg-[var(--button-color)] cursor-pointer">
                    Xóa thành viên
                </div>
            )}
        </div>
    );
};

export default MemberPopover;
