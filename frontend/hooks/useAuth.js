// hooks/useAuth.js
"use client";

import { useState, useEffect } from "react";
import { isAuthenticated, logoutUser } from "../utils/api";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sprawdź stan autentyfikacji przy załadowaniu
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        const email = localStorage.getItem("userEmail");
        setUserEmail(email || "");
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUserEmail("");
  };

  return {
    isLoggedIn,
    userEmail,
    loading,
    logout,
  };
}
