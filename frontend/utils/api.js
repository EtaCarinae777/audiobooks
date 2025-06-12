// utils/api.js
const API_BASE_URL = "http://127.0.0.1:8000";

// Rejestracja użytkownika
export async function registerUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Obsługa błędów z serwera
      throw new Error(
        data.email?.[0] || data.password?.[0] || "Błąd rejestracji"
      );
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// Logowanie użytkownika
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Błąd logowania");
    }

    // Zapisz token w localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", data.user.email);
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Wylogowanie
export function logoutUser() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
}

// Sprawdź czy użytkownik jest zalogowany
export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}
