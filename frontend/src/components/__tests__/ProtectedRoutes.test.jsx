import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
  const token = localStorage.getItem("Token");
  // dodac sprawdzenie czy token jest wazny

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
