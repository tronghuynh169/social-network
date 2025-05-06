import React from "react";
import { MoreVertical, UserPlus } from "lucide-react";

const MembersSection = ({
    membersInfo,
    isGroup,
    myProfileId,
    admin,
    setShowAddMemberModal,
}) => (
    <div className="space-y-3">
        {membersInfo
            .filter((member) => isGroup || member._id !== myProfileId)
            .map((member) => (
                <div
                    key={member._id}
                    className="flex justify-between items-center p-2 rounded cursor-pointer"
                >
                    <div className="flex items-center">
                        <img
                            src={member.avatar}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                            <div className="font-medium">{member.fullName}</div>
                            {admin && member._id === admin._id && (
                                <div className="text-xs text-[var(--text-secondary-color)] italic">
                                    Quản trị viên
                                </div>
                            )}
                        </div>
                    </div>
                    <MoreVertical
                        size={18}
                        className="text-[var(--text-secondary-color)]"
                    />
                </div>
            ))}
        {isGroup && (
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

export default MembersSection;
