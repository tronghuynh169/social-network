import React, { useState } from "react";

const EditProfile = () => {
    const [bio, setBio] = useState("");
    const [gender, setGender] = useState("Nam");

    return (
        <div className="max-w-2xl mx-auto p-6 rounded-lg mt-3">
            {/* Tiêu đề */}
            <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa trang cá nhân</h2>

            {/* Avatar + Tên */}
            <div className="flex items-center space-x-4 bg-[var(--secondary-color)] p-4 rounded-lg mt-8">
                <img
                    src="https://via.placeholder.com/50"
                    alt="avatar"
                    className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                    <p className="font-semibold">bfgoc.bfgoc</p>
                </div>
            </div>

            {/* Trang Web */}
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">Trang web cá nhân</label>
                <input
                    type="text"
                    placeholder="Trang web"
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
                />
            </div>

            {/* Tiểu sử */}
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">Tiểu sử</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={150}
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
                    placeholder="Tiểu sử"
                ></textarea>
                <p className="text-righttext-sm">{bio.length} / 150</p>
            </div>

            {/* Giới tính */}
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">Giới tính</label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md cursor-pointer"
                >
                    <option className="bg-[var(--secondary-color)]">Khác</option>
                    <option className="bg-[var(--secondary-color)]">Nam</option>
                    <option className="bg-[var(--secondary-color)]">Nữ</option>
                </select>
                <p className="text-gray-400 text-sm mt-2">
                    Thông tin này sẽ không xuất hiện trên trang cá nhân công khai của bạn.
                </p>
            </div>

            {/* Trang Web */}
            <div className="mt-4">
                <label className="block mt-8 mb-3 font-semibold">Địa chỉ</label>
                <input
                    type="text"
                    placeholder="Địa chỉ"
                    className="w-full p-2 border-[1px] border-[var(--secondary-color)] rounded-md"
                />
            </div>

            {/* Nút Lưu */}
            <div className="mt-6 text-end">
                <button
                    className="w-[40%] bg-blue-500 py-2 rounded-md text-white font-semibold hover:bg-blue-600 cursor-pointer"
                >
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
