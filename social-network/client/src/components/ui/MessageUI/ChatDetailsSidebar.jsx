import React, { useState } from "react";
import AccordionItem from "./AccordionItem/AccordionItem";
import CustomizationSection from "./AccordionItem/CustomizationSection";
import MembersSection from "./AccordionItem/MembersSection";
import MediaSection from "./AccordionItem/MediaSection";
import PrivacySection from "./AccordionItem/PrivacySection";

const ChatDetailsSidebar = ({
    admin,
    membersInfo,
    isGroup,
    myProfileId,
    setShowAddMemberModal,
    conversationId,
    handleRemoveMember,
    handleChangeAdmin,
    handleOpenModal,
    messages,
}) => {
    const [openSection, setOpenSection] = useState("Thông tin");

    const toggleSection = (sectionName) => {
        setOpenSection((prev) => (prev === sectionName ? "" : sectionName));
    };

    return (
        <div className="w-[350px] h-full bg-[var(--background-color)]">
            <AccordionItem
                title="Tùy chỉnh"
                isOpen={openSection === "Tùy chỉnh"}
                onClick={() => toggleSection("Tùy chỉnh")}
            >
                <CustomizationSection handleOpenModal={handleOpenModal} />
            </AccordionItem>

            {isGroup && (
                <AccordionItem
                    title="Thành viên"
                    isOpen={openSection === "Thành viên"}
                    onClick={() => toggleSection("Thành viên")}
                >
                    <MembersSection
                        membersInfo={membersInfo}
                        isGroup={isGroup}
                        myProfileId={myProfileId}
                        admin={admin}
                        setShowAddMemberModal={setShowAddMemberModal}
                        conversationId={conversationId}
                        handleRemoveMember={handleRemoveMember}
                        handleChangeAdmin={handleChangeAdmin}
                    />
                </AccordionItem>
            )}

            <AccordionItem
                title="Ảnh và file phương tiện"
                isOpen={openSection === "Ảnh và file phương tiện"}
                onClick={() => toggleSection("Ảnh và file phương tiện")}
            >
                <MediaSection messages={messages} />
            </AccordionItem>

            <AccordionItem
                title="Riêng tư và hỗ trợ"
                isOpen={openSection === "Riêng tư và hỗ trợ"}
                onClick={() => toggleSection("Riêng tư và hỗ trợ")}
            >
                <PrivacySection
                    admin={admin}
                    isGroup={isGroup}
                    myProfileId={myProfileId}
                    conversationId={conversationId}
                    handleRemoveMember={handleRemoveMember}
                />
            </AccordionItem>
        </div>
    );
};

export default ChatDetailsSidebar;
