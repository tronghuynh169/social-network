import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes";

function App() {
  return (
    <Router>
      <Routes>
        {routes.map(({ path, element, children }, index) => (
          <Route key={index} path={path} element={element}>
            {children.map(({ path, element: ChildElement }, childIndex) => (
              <Route key={childIndex} path={path} element={ChildElement} />
            ))}
          </Route>
        ))}

        {/* Redirect nếu không tìm thấy route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;