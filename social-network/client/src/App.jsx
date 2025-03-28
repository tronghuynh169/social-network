import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import "./GlobalStyle/globalStyle.scss";

const App = () => {
    return (
        <Router>
            <Routes>
                {routes.map(({ path, element, children }, index) => (
                    <Route key={index} path={path} element={element}>
                        {children?.map(
                            ({ path, element: ChildElement }, childIndex) => (
                                <Route
                                    key={childIndex}
                                    path={path}
                                    element={ChildElement}
                                />
                            )
                        )}
                    </Route>
                ))}
            </Routes>
        </Router>
    );
};

export default App;
