import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { UserProvider } from "./context/UserContext";
import { useLocation } from "react-router-dom";
import "./GlobalStyle/globalStyle.scss";
import PostDetailPage from "~/pages/PostPage/PostDetailPage";
import { PostProvider } from "./context/PostContext";
import { CallProvider } from "~/context/CallContext";
import CallModal from "./CallModal";
import IncomingCallModal from "./IncomingCallModal";
const App = () => {
    return (
        <UserProvider>
            <CallProvider>
                <PostProvider>
                    <Router>
                        <AppRoutes />
                        <CallModal />
                        <IncomingCallModal />
                    </Router>
                </PostProvider>
            </CallProvider>
        </UserProvider>
    );
};

const AppRoutes = () => {
    const location = useLocation();
    const backgroundLocation = location.state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation || location}>
                {routes.map(({ path, element, children }, index) => (
                    <Route key={index} path={path} element={element}>
                        {children?.map(
                            ({ path, element: ChildElement }, childIndex) => {
                                // Nếu đang là modal, không render post detail ở đây
                                if (path === "post/:id" && backgroundLocation)
                                    return null;
                                return (
                                    <Route
                                        key={childIndex}
                                        path={path}
                                        element={ChildElement}
                                    />
                                );
                            }
                        )}
                    </Route>
                ))}
            </Routes>

            {/* Nếu có backgroundLocation, render PostDetailPage dưới dạng modal */}
            {backgroundLocation && (
                <Routes>
                    <Route
                        path="/post/:id"
                        element={<PostDetailPage isModal />}
                    />
                </Routes>
            )}
        </>
    );
};

export default App;
