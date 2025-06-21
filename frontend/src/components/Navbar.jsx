import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AxiosInstance from "./AxiosInstance";
import {
  Home,
  LogOut,
  Search,
  Library,
  Headphones,
  User,
  CheckCircle,
} from "lucide-react";

const Navbar = (props) => {
  const { content } = props;
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  // Pobierz informacje o zalogowanym użytkowniku
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("Token");
        if (token) {
          setUserInfo({
            email: "user@example.com", // Tymczasowo
            isLoggedIn: true,
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const logoutUser = () => {
    AxiosInstance.post(`logoutall/`, {}).then(() => {
      localStorage.removeItem("Token");
      setUserInfo(null);
      navigate("/");
    });
  };

  const menuItems = [
    {
      key: "home",
      path: "/home",
      icon: Home,
      label: "Strona główna",
    },
    {
      key: "search",
      path: "/search",
      icon: Search,
      label: "Wyszukaj",
    },
    {
      key: "library",
      path: "/yourlibrary",
      icon: Library,
      label: "Twoja biblioteka",
    },
    {
      key: "account",
      path: "/account",
      icon: User,
      label: "Konto",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Sidebar */}
      <div className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center h-16 px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Audit
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.path === path;

            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-white/70"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {userInfo && (
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/10 rounded-xl p-4 text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold text-white">
                {userInfo.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Witaj!</p>
                <p className="text-white/70 text-xs truncate">
                  {userInfo.email}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-medium">
                  Online
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logoutUser}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 hover:translate-x-1"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Wyloguj</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white/10 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold text-white"></h1> {/* User Status */}
          {userInfo && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">
                  Zalogowany
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 rounded-full px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {userInfo.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">
                  {userInfo.email || "Użytkownik"}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{content}</main>
      </div>
    </div>
  );
};

export default Navbar;
