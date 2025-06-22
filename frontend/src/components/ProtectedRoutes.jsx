import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
  const token = localStorage.getItem("Token");
<<<<<<< HEAD
  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };
  return token && isTokenValid(token) ? <Outlet /> : <Navigate to="/login" />;
};

=======
  // dodac sprawdzenie czy token jest wazny

  return token ? <Outlet /> : <Navigate to="/" />;
};
>>>>>>> ec13e8455441e0e5e285a45b95017b1698d6ae71
export default ProtectedRoutes;
