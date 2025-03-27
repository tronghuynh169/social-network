import { Navigate, Outlet } from "react-router-dom";
import Home from "~/pages/Home/Home";
import Login from "~/pages/AuthPage/Login";
import Register from "~/pages/AuthPage/Register";
import ForgotPassword from "~/pages/AuthPage/ForgotPassword";
import ResetPassword from "~/pages/AuthPage/ResetPassword"; // Thêm ResetPassword

// ✅ Route dành cho người ĐÃ đăng nhập
const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" />;
};

// ✅ Route dành cho khách (chưa đăng nhập)
const PublicRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" /> : <Outlet />;
};

// ✅ Danh sách routes
export const routes = [
  {
    path: "/", // Route dành cho người ĐÃ đăng nhập
    element: <PrivateRoute />,
    children: [{ path: "", element: <Home /> }],
  },
  {
    path: "/", // Route dành cho khách (chưa đăng nhập)
    element: <PublicRoute />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password/:token", element: <ResetPassword /> }, // Route đặt lại mật khẩu
    ],
  },
  {
    path: "*", // Trang 404 nếu route không tồn tại
    element: <Navigate to="/" />,
  },
];
