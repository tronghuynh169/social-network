import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home'

function App() {

    return (
        <Router>
            <Routes>
            <Route path="/register" element={<Register />}/>
            <Route path="/login" element={<Login />} />
            <Route
            path="/"
            element={
                <PrivateRoute>
                <Home />
                </PrivateRoute>
                }
            />
            </Routes>
        </Router>
    );
}

export default App;