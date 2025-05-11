import React, { useState } from "react";
import AccordionItem from "./AccordionItem/AccordionItem";
import ChatInfoSection from "./AccordionItem/ChatInfoSection";
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
}) => {
    const [openSection, setOpenSection] = useState("Thông tin");

    const toggleSection = (sectionName) => {
        setOpenSection((prev) => (prev === sectionName ? "" : sectionName));
    };

    return (
        <div className="w-[350px] h-full bg-[var(--background-color)]">
            <AccordionItem
                title="Thông tin"
                isOpen={openSection === "Thông tin"}
                onClick={() => toggleSection("Thông tin")}
            >
                <ChatInfoSection />
            </AccordionItem>

            <AccordionItem
                title="Tùy chỉnh"
                isOpen={openSection === "Tùy chỉnh"}
                onClick={() => toggleSection("Tùy chỉnh")}
            >
                <CustomizationSection />
            </AccordionItem>

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
                />
            </AccordionItem>

            <AccordionItem
                title="Ảnh và file phương tiện"
                isOpen={openSection === "Ảnh và file phương tiện"}
                onClick={() => toggleSection("Ảnh và file phương tiện")}
            >
                <MediaSection />
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
                    handleRemoveMember={handleRemoveMember}
                />
            </AccordionItem>
        </div>
    );
};

export default ChatDetailsSidebar;
