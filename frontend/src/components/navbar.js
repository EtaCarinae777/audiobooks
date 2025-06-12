"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isLoggedIn, userEmail, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="text-xl font-bold">AudioBooks</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold hover:text-blue-200 transition-colors"
          >
            AudioBooks
          </Link>

          {/* Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Informacja o zalogowanym użytkowniku */}
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                    ✅ Zalogowany: <strong>{userEmail}</strong>
                  </div>

                  <Link
                    href="/library"
                    className="hover:text-blue-200 transition-colors font-medium"
                  >
                    📚 Moja biblioteka
                  </Link>

                  <Link
                    href="/profile"
                    className="hover:text-blue-200 transition-colors font-medium"
                  >
                    👤 Profil
                  </Link>

                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    🚪 Wyloguj
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Menu dla niezalogowanych */}
                <div className="bg-red-500 px-3 py-1 rounded-full text-sm">
                  ❌ Nie zalogowany
                </div>

                <Link
                  href="/login"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  🔑 Logowanie
                </Link>

                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    ✍️ Rejestracja
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
