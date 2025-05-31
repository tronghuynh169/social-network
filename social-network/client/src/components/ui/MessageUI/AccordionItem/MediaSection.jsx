import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import ImageModal from "../Modal/ImageModal";

dayjs.locale("vi");

const MediaSection = ({ messages }) => {
    const [activeTab, setActiveTab] = useState("images");
    const [selectedImage, setSelectedImage] = useState(null); // ✅ State modal ảnh

    const sentFiles = messages
        .filter((msg) => msg.files && msg.files.length > 0)
        .flatMap((msg) =>
            msg.files.map((file) => ({
                ...file,
                createdAt: msg.createdAt,
            }))
        );

    const imageFiles = sentFiles
        .filter((file) => file.type?.startsWith("image/"))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const otherFiles = sentFiles
        .filter((file) => !file.type?.startsWith("image/"))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const groupByMonth = (files) =>
        files.reduce((acc, file) => {
            const monthKey = dayjs(file.createdAt).format("YYYY-MM");
            if (!acc[monthKey]) acc[monthKey] = [];
            acc[monthKey].push(file);
            return acc;
        }, {});

    const getFileUrl = (file) =>
        file.url || file.path || `http://localhost:5000/${file.filename}`;

    return (
        <div className="text-sm text-white">
            {/* Tabs */}
            <div className="flex border-b border-white/20 mb-3">
                <button
                    onClick={() => setActiveTab("images")}
                    className={`mr-6 pb-1 border-b-2 cursor-pointer ${
                        activeTab === "images"
                            ? "border-blue-500 text-blue-500 font-semibold"
                            : "border-transparent text-white/70"
                    }`}
                >
                    File phương tiện
                </button>
                <button
                    onClick={() => setActiveTab("files")}
                    className={`pb-1 border-b-2 cursor-pointer ${
                        activeTab === "files"
                            ? "border-blue-500 text-blue-500 font-semibold"
                            : "border-transparent text-white/70"
                    }`}
                >
                    File
                </button>
            </div>

            {/* Tab content */}
            {activeTab === "images" && (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {Object.entries(groupByMonth(imageFiles))
                        .sort((a, b) =>
                            dayjs(b[0]).isAfter(dayjs(a[0])) ? 1 : -1
                        )
                        .map(([month, files]) => (
                            <div key={month}>
                                <h2 className="text-base font-semibold text-white mb-2">
                                    Tháng {dayjs(month).format("M")}
                                </h2>
                                <div className="grid grid-cols-3 gap-3">
                                    {files.map((file, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setSelectedImage(
                                                    getFileUrl(file)
                                                )
                                            }
                                            className="block"
                                        >
                                            <img
                                                src={getFileUrl(file)}
                                                alt="Ảnh đã gửi"
                                                className="w-full h-24 object-cover rounded-md border border-white/10 cursor-pointer"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {activeTab === "files" && (
                <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {otherFiles.map((file, index) => (
                        <li key={index}>
                            <a
                                href={getFileUrl(file)}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 hover:bg-white/10 px-2 py-1 rounded-md transition"
                            >
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xl">
                                    📄
                                </div>
                                <div className="flex flex-col text-sm truncate w-40">
                                    <span className="font-medium truncate">
                                        {file.originalname ||
                                            file.name ||
                                            file.filename}
                                    </span>
                                    <span className="text-xs text-white/60">
                                        {dayjs(file.createdAt).format(
                                            "DD/MM/YYYY"
                                        )}
                                    </span>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            )}

            {/* ✅ Modal xem ảnh */}
            <ImageModal
                isOpen={!!selectedImage}
                image={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div>
    );
};

export default MediaSection;
