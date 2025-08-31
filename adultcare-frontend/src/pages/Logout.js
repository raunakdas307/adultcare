import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      try {
        

      } catch (error) {
        console.warn("Logout request failed (continuing):", error?.message || error);
      } finally {
        // Clear tokens + user info
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        localStorage.removeItem("role");

        // Redirect to login
        navigate("/login", { replace: true });
      }
    };
    go();
  }, [navigate]);

  return null;
};

export default Logout;
