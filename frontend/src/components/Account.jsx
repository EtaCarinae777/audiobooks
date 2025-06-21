import React from "react";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
} from "lucide-react";

const Account = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <User className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Twoje Konto
            </h1>
          </div>
          <p className="text-xl text-white/70">
            Zarządzaj swoim profilem i ustawieniami
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <User className="w-6 h-6 mr-3 text-blue-400" />
            Informacje o profilu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Email
                </label>
                <div className="text-white text-lg">user@example.com</div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Imię i nazwisko
                </label>
                <div className="text-white text-lg">Jan Kowalski</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Data rejestracji
                </label>
                <div className="text-white text-lg">15 maja 2024</div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Status konta
                </label>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-400 font-medium">Aktywne</span>
                </div>
              </div>
            </div>
          </div>

          <button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105">
            Edytuj profil
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ustawienia</h3>
                <p className="text-white/60 text-sm">Konfiguruj preferencje</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Płatności</h3>
                <p className="text-white/60 text-sm">
                  Zarządzaj metodami płatności
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Powiadomienia
                </h3>
                <p className="text-white/60 text-sm">Skonfiguruj alerty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-emerald-400" />
            Bezpieczeństwo
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <h3 className="text-white font-medium">Zmień hasło</h3>
                <p className="text-white/60 text-sm">
                  Ostatnia zmiana: 30 dni temu
                </p>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                Zmień
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <h3 className="text-white font-medium">
                  Uwierzytelnianie dwuskładnikowe
                </h3>
                <p className="text-white/60 text-sm">
                  Dodatkowa warstwa bezpieczeństwa
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm">Wyłączone</span>
                <button className="ml-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  Włącz
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <HelpCircle className="w-6 h-6 mr-3 text-purple-400" />
            Pomoc i wsparcie
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Centrum pomocy</h3>
                <p className="text-white/60 text-sm">Często zadawane pytania</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Kontakt z pomocą</h3>
                <p className="text-white/60 text-sm">Napisz do nas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
