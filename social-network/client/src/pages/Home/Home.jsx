import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h2 className="text-white">Home Page</h2>
      <button className="bg-white" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;