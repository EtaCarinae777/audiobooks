"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";

// Funkcje API (wbudowane żeby uniknąć problemów z importowaniem)
function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("authToken");
}

function getUserEmail() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userEmail") || "";
}

function logoutUser() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Teraz dynamiczny!
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Sprawdź stan logowania przy załadowaniu
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(isAuthenticated());
      setUserEmail(getUserEmail());
    };

    checkAuthStatus();

    // Nasłuchuj zmian w localStorage (synchronizacja między kartami)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUserEmail("");
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="border-b border-gray-200 py-4 relative">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          <img className="w-60" src="/logo.png" alt="Logo" />
        </Link>

        {/* Przycisk menu hamburgerowego (widoczny tylko na mobilnych) */}
        <button
          className="md:hidden flex items-center p-2"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nawigacja na desktopie */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Audiobooki
          </Link>
          <Link
            href="/produkty"
            className="hover:text-blue-600 transition-colors"
          >
            Kategorie
          </Link>
          <Link href="/o-nas" className="hover:text-blue-600 transition-colors">
            Wypróbuj za darmo
          </Link>
          <Link
            href="/kontakt"
            className="hover:text-blue-600 transition-colors"
          >
            Pomoc
          </Link>

          {/* Ikona profilu z rozwijanym menu */}
          <div className="relative">
            <button
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                isLoggedIn
                  ? "bg-green-100 hover:bg-green-200 text-green-700"
                  : "hover:bg-gray-100"
              }`}
              onClick={toggleProfileDropdown}
              aria-label="Menu profilu"
              title={isLoggedIn ? `Zalogowany: ${userEmail}` : "Menu profilu"}
            >
              <User size={24} />
              {isLoggedIn && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </button>

            {/* Rozwijane menu profilu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                {isLoggedIn ? (
                  <>
                    {/* Informacja o zalogowanym użytkowniku */}
                    <div className="px-4 py-2 text-sm border-b border-gray-100">
                      <div className="font-medium text-gray-900">
                        {userEmail}
                      </div>
                      <div className="text-xs text-green-600">
                        ✅ Zalogowany
                      </div>
                    </div>

                    <Link
                      href="/profil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      👤 Mój profil
                    </Link>
                    <Link
                      href="/biblioteka"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      📚 Moja biblioteka
                    </Link>
                    <Link
                      href="/ustawienia"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      ⚙️ Ustawienia
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Wyloguj się
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-sm border-b border-gray-100">
                      <div className="text-xs text-gray-500">
                        ❌ Nie zalogowany
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      🔑 Zaloguj się
                    </Link>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      ✍️ Zarejestruj się
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobilne menu hamburgerowe (wysuwa się, gdy isMenuOpen=true) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white z-50 shadow-lg">
          <div className="container mx-auto py-4 flex flex-col">
            <nav className="flex flex-col space-y-4 mb-6">
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Audiobooki
              </Link>
              <Link
                href="/produkty"
                className="hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Kategorie
              </Link>
              <Link
                href="/o-nas"
                className="hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Wypróbuj za darmo
              </Link>
              <Link
                href="/kontakt"
                className="hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Pomoc
              </Link>
            </nav>
            <div className="flex flex-col space-y-3">
              {isLoggedIn ? (
                <>
                  {/* Info o użytkowniku na mobile */}
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-sm font-medium">{userEmail}</div>
                    <div className="text-xs text-green-600">✅ Zalogowany</div>
                  </div>

                  <Link
                    href="/profil"
                    className="py-2 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Mój profil
                  </Link>
                  <Link
                    href="/biblioteka"
                    className="py-2 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📚 Moja biblioteka
                  </Link>
                  <Link
                    href="/ustawienia"
                    className="py-2 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ⚙️ Ustawienia
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-2 text-left text-red-600"
                  >
                    🚪 Wyloguj się
                  </button>
                </>
              ) : (
                <>
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-xs text-gray-500">
                      ❌ Nie zalogowany
                    </div>
                  </div>
                  <Link
                    href="/login"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      🔑 Zaloguj się
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
