import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
  const token = localStorage.getItem("Token");
  
  // Knox tokeny to proste stringi, nie JWT
  // Sprawdzamy tylko czy token istnieje i jest poprawny
  const isTokenValid = (token) => {
    if (!token) return false;
    if (token === "undefined" || token === "null") return false;
    if (token.trim() === "") return false;
    
    // Knox tokeny mają zwykle długość 40+ znaków
    if (token.length < 20) return false;
    
    return true;
  };
  
  return token && isTokenValid(token) ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;