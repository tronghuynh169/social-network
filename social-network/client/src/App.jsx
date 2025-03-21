import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
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
                <ProtectedRoute>
                <Home />
                </ProtectedRoute>
                }
            />
            </Routes>
        </Router>
    );
}

export default App;