import { Outlet, Link } from "react-router-dom";
import { Settings, User, Lock, Edit } from "lucide-react";

export default function AccountLayout() {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar cố định */}
            <div className="w-64 p-4 border-r">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Trung tâm tài khoản
                </h2>

                <nav className="space-y-2">
                    <Link
                        to="/account"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                    >
                        <User className="w-4 h-4" /> Thông tin chung
                    </Link>
                    <Link
                        to="/account/edit-profile"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                    >
                        <Edit className="w-4 h-4" /> Chỉnh sửa trang cá nhân
                    </Link>
                    <Link
                        to="/account/privacy"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                    >
                        <Lock className="w-4 h-4" /> Quyền riêng tư
                    </Link>
                </nav>
            </div>

            {/* Nội dung bên phải sẽ thay đổi */}
            <div className="flex-1 p-8">
                <Outlet />
                <div>hello</div>
            </div>
        </div>
    );
}
