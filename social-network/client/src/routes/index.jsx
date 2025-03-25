import { Navigate } from "react-router-dom";
import Home from "~/pages/Home";
import Menu from "~/pages/Menu";
import ItemDetail from "~/components/ItemCart/ItemDetail";
import Promotion from "~/pages/Promotion";
import Order from "~/pages/Order";
import Login from "~/pages/Login";
import Register from "~/pages/Register";
import Admin from "~/pages/Admin";
import ShoppingCart from "~/pages/ShoppingCart";
import AdminMenu from "~/pages/Admin/Menu"; // ✅ Thêm trang con của Admin
import AdminOrders from "~/pages/Admin/ShoppingCart"; // ✅ Thêm trang con của Admin

// ✅ Hàm lấy danh sách routes dựa trên role
export function getRoutes(role) {
    console.log("Role hiện tại:", role); // 🛠 Kiểm tra role có đúng không

    const publicRoutes = [
        { path: "/", component: Home },
        { path: "/thuc-don", component: Menu },
        { path: "/thuc-don/:category?", component: Menu },
        { path: "/thuc-don/:category?/:slug", component: ItemDetail },
        { path: "/login", component: Login },
        { path: "/register", component: Register },
        { path: "/dat-hang", component: Order },
        { path: "/gio-hang", component: ShoppingCart },
    ];

    const privateRoutes =
        role === "Admin"
            ? [
                  {
                      path: "/admin",
                      component: Admin,
                      children: [
                          { path: "thuc-don", component: AdminMenu },
                          { path: "don-hang", component: AdminOrders },
                      ],
                  },
              ]
            : [
                  { path: "/admin", component: () => <Navigate to="/" /> }, // 🛠 Chặn truy cập admin nếu không phải Admin
              ];

    return { publicRoutes, privateRoutes };
}