import { Navigate, Outlet } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

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
    path: "/",
    element: <PrivateRoute />,
    children: [{ path: "", element: <Home /> }],
  },
  {
    path: "/",
    element: <PublicRoute />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
];