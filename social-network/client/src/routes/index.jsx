import { Navigate, Outlet } from "react-router-dom";
import DefaultLayout from "~/components/layout/DefaultLayout";
import Login from "~/pages/AuthPage/Login";
import Register from "~/pages/AuthPage/Register";
import ForgotPassword from "~/pages/AuthPage/ForgotPassword";
import ResetPassword from "~/pages/AuthPage/ResetPassword";
import HomePage from "~/pages/HomePage/HomePage";
import FriendPage from "~/pages/FriendPage/FriendPage";
import ProfilePage from "~/pages/ProfilePage/ProfilePage";

// ✅ Route dành cho người ĐÃ đăng nhập
const PrivateRoute = () => {
    const token = localStorage.getItem("token");
    return token ? (
        <DefaultLayout>
            <Outlet />
        </DefaultLayout>
    ) : (
        <Navigate to="/login" />
    );
};

// ✅ Route dành cho khách (chưa đăng nhập)
const PublicRoute = () => {
    const token = localStorage.getItem("token");
    return token ? <Navigate to="/" /> : <Outlet />;
};

// ✅ Danh sách routes với DefaultLayout được áp dụng đúng cách
export const routes = [
    {
        path: "/", // Route dành cho người ĐÃ đăng nhập
        element: <PrivateRoute />,
        children: [
            {
                path: "",
                element: <HomePage />,
            },
            {
                path: "friend",
                element: <FriendPage />,
            },
            {
                path: ":slug",
                element: <ProfilePage />,
            },
        ],
    },
    {
        path: "/", // Route dành cho khách (chưa đăng nhập)
        element: <PublicRoute />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password/:token", element: <ResetPassword /> },
        ],
    },
    {
        path: "*", // Trang 404 nếu route không tồn tại
        element: <Navigate to="/" />,
    },
];
