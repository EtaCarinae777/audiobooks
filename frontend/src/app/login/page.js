"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API funkcje wbudowane bezpośrednio
const API_BASE_URL = "http://127.0.0.1:8000";

async function registerUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
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

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Błąd logowania");
    }

    // Zapisz token w localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", data.user.email);

      // Powiadom inne komponenty o zmianie
      window.dispatchEvent(new Event("storage"));
    }
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export default function AuthPage() {
  const router = useRouter();

  // Stan dla formularza logowania
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Stan dla formularza rejestracji
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Stan dla komunikatów
  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginMessage("");

    try {
      const result = await loginUser(loginEmail, loginPassword);
      console.log("Logowanie pomyślne:", result);

      setLoginMessage("Zalogowano pomyślnie!");

      // Wyczyść formularz
      setLoginEmail("");
      setLoginPassword("");

      // Przekieruj na główną stronę po pomyślnym logowaniu
      setTimeout(() => {
        router.push("/"); // Przekierowanie na stronę główną
      }, 1500);
    } catch (error) {
      setLoginMessage(`Błąd: ${error.message}`);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterMessage("");

    // Walidacja hasła
    if (registerPassword !== registerConfirmPassword) {
      setRegisterMessage("Błąd: Hasła nie są identyczne");
      setIsRegisterLoading(false);
      return;
    }

    if (registerPassword.length < 8) {
      setRegisterMessage("Błąd: Hasło musi mieć co najmniej 8 znaków");
      setIsRegisterLoading(false);
      return;
    }

    try {
      const result = await registerUser(registerEmail, registerPassword);
      console.log("Rejestracja pomyślna:", result);

      setRegisterMessage("Rejestracja pomyślna! Możesz się teraz zalogować.");

      // Wyczyść formularz
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
    } catch (error) {
      setRegisterMessage(`Błąd: ${error.message}`);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Lewa kolumna z formularzami */}
          <div className="w-full md:w-1/2 p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Logowanie</TabsTrigger>
                <TabsTrigger value="register">Rejestracja</TabsTrigger>
              </TabsList>

              {/* Zakładka logowania */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e-mail"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Hasło
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Zapamiętaj mnie
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link
                        href="/reset-password"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Zapomniałeś hasła?
                      </Link>
                    </div>
                  </div>

                  {/* Komunikat dla logowania */}
                  {loginMessage && (
                    <div
                      className={`p-3 rounded text-sm ${
                        loginMessage.includes("Błąd")
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-green-100 text-green-700 border border-green-300"
                      }`}
                    >
                      {loginMessage}
                    </div>
                  )}

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoginLoading}
                    >
                      {isLoginLoading ? "Logowanie..." : "Zaloguj się"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Zakładka rejestracji */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label
                      htmlFor="register-email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="twoj@email.pl"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="register-password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Hasło
                    </label>
                    <input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Potwierdź hasło
                    </label>
                    <input
                      id="register-confirm-password"
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="accept-terms"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Akceptuję{" "}
                      <Link
                        href=""
                        className="text-blue-600 hover:text-blue-800"
                      >
                        regulamin
                      </Link>{" "}
                      i{" "}
                      <Link
                        href=""
                        className="text-blue-600 hover:text-blue-800"
                      >
                        politykę prywatności
                      </Link>
                    </label>
                  </div>

                  {/* Komunikat dla rejestracji */}
                  {registerMessage && (
                    <div
                      className={`p-3 rounded text-sm ${
                        registerMessage.includes("Błąd")
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-green-100 text-green-700 border border-green-300"
                      }`}
                    >
                      {registerMessage}
                    </div>
                  )}

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isRegisterLoading}
                    >
                      {isRegisterLoading ? "Rejestracja..." : "Zarejestruj się"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Prawa kolumna z obrazkiem i tekstem */}
          <div className="w-full md:w-1/2 bg-blue-400 text-white p-8 flex flex-col justify-center">
            <div className="mb-6 flex justify-center">
              <img
                src="/car3.jpg"
                alt="Audiobooki"
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Twoja biblioteka audiobooków
            </h2>
            <p className="text-center mb-4">
              Odkryj tysiące audiobooków z naszej kolekcji i ciesz się nimi na
              każdym urządzeniu.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Nielimitowany dostęp do tysięcy tytułów
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Słuchaj na dowolnym urządzeniu
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Nowe tytuły każdego tygodnia
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Pierwsze 14 dni za darmo
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
