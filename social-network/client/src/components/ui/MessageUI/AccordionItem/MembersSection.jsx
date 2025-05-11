import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, UserPlus } from "lucide-react";
import MemberPopover from "../Popover/MemberPopover";
import { Link } from "react-router-dom";

const MembersSection = ({
    membersInfo,
    isGroup,
    myProfileId,
    admin,
    setShowAddMemberModal,
    conversationId,
    handleRemoveMember,
    handleChangeAdmin,
}) => {
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef(null);

    const togglePopover = (id) => {
        setOpenPopoverId((prev) => (prev === id ? null : id));
    };

    // Đóng popover khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target)
            ) {
                setOpenPopoverId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="space-y-3">
            {membersInfo
                .filter((member) => isGroup || member?._id !== myProfileId)
                .map((member) => (
                    <div
                        key={member._id}
                        className="flex justify-between items-center p-2 rounded cursor-pointer relative"
                    >
                        <Link
                            to={`/${member.slug}`}
                            className="flex items-center w-full"
                        >
                            <img
                                src={member.avatar}
                                alt={member.fullName}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <div className="font-medium">
                                    {member.fullName}
                                </div>
                                {admin && member._id === admin._id && (
                                    <div className="text-xs text-[var(--text-secondary-color)] italic">
                                        Quản trị viên
                                    </div>
                                )}
                            </div>
                        </Link>
                        <div
                            className="relative"
                            ref={
                                openPopoverId === member._id ? popoverRef : null
                            }
                        >
                            <MoreVertical
                                size={18}
                                className="text-[var(--text-secondary-color)] cursor-pointer"
                                onClick={() => togglePopover(member._id)}
                            />
                            {openPopoverId === member._id && (
                                <div className="absolute bottom-full mb-2 right-0 z-10">
                                    <MemberPopover
                                        member={member}
                                        myProfileId={myProfileId}
                                        admin={admin}
                                        isGroup={isGroup}
                                        conversationId={conversationId}
                                        handleRemoveMember={handleRemoveMember}
                                        handleChangeAdmin={handleChangeAdmin}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            {isGroup && myProfileId === admin._id && (
                <button
                    className="w-full flex items-center gap-3 px-2 py-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg"
                    onClick={() => setShowAddMemberModal(true)}
                >
                    <UserPlus />
                    Thêm thành viên
                </button>
            )}
        </div>
    );
};

export default MembersSection;
