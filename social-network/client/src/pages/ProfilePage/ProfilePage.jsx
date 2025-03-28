import React from "react";
import { Settings } from "lucide-react";

const ProfilePage = () => {
    return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center mt-3">
            {/* Profile Header */}
            <div className="w-full max-w-4xl p-6 flex items-center space-x-8">
                {/* Avatar */}
                <div className="relative">
                    <img
                        src="https://via.placeholder.com/150"
                        alt="Avatar"
                        className="w-32 h-32 rounded-full border-4 border-gray-700"
                    />
                </div>

                {/* User Info */}
                <div className="flex flex-col space-y-2 ml-10">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl">bfngoc.bfngoc</h1>
                        <button className="bg-gray-800 px-4 py-2 rounded-md">
                            Chỉnh sửa trang cá nhân
                        </button>
                        <button className="bg-gray-800 px-4 py-2 rounded-md">
                            Xem kho lưu trữ
                        </button>
                        <Settings className="cursor-pointer" />
                    </div>
                    <div className="flex space-x-6 mt-4">
                        <span>
                            <strong>0</strong> bài viết
                        </span>
                        <span>
                            <strong>31</strong> người theo dõi
                        </span>
                        <span>
                            Đang theo dõi <strong>11</strong> người dùng
                        </span>
                    </div>
                    <span className="font-semibold mt-4">Rikka Takanashi</span>
                </div>
            </div>

            {/* Highlights */}
            <div className="flex space-x-4 p-4 mt-4">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-2 border-gray-500 flex items-center justify-center rounded-full">
                        <span className="text-2xl">+</span>
                    </div>
                    <span className="text-sm mt-2">Mới</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-700 w-full max-w-4xl mt-10 flex justify-center space-x-8 ">
                <button className="py-2 border-b-2 border-white">
                    BÀI VIẾT
                </button>
                <button className="py-2 text-gray-500">ĐÃ LƯU</button>
                <button className="py-2 text-gray-500">ĐƯỢC GẮN THẺ</button>
            </div>

            {/* Empty Content */}
            <div className="flex flex-col items-center mt-12">
                <div className="w-16 h-16 border-2 border-gray-500 flex items-center justify-center rounded-full">
                    📷
                </div>
                <h2 className="text-xl font-bold mt-4">Chia sẻ ảnh</h2>
                <p className="text-gray-500 text-sm">
                    Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân của
                    bạn.
                </p>
                <button className="text-blue-500 mt-4">
                    Chia sẻ ảnh đầu tiên của bạn
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
