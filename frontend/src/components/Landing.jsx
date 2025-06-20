import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  Headphones,
  BookOpen,
  Star,
  User,
  LogIn,
  UserPlus,
  Menu,
  Zap,
  Download,
  Heart,
  ChevronRight,
  Volume2,
  Clock,
  Users,
  Award,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [animateIn, setAnimateIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik jest już zalogowany
    const token = localStorage.getItem("Token");
    if (token) {
      navigate("/home");
      return;
    }

    // Animacja wejścia
    setTimeout(() => setAnimateIn(true), 100);
  }, [navigate]);

  const features = [
    {
      icon: <Volume2 className="w-8 h-8 text-blue-400" />,
      title: "Wysokiej Jakości Audio",
      description:
        "Słuchaj audiobooków w doskonałej jakości dźwięku z profesjonalnymi lektorami w formacie HD.",
    },
    {
      icon: <BookOpen className="w-8 h-8 text-emerald-400" />,
      title: "Ogromna Biblioteka",
      description:
        "Tysiące audiobooków z różnych kategorii - od klasyki literatury po najnowsze bestsellery.",
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      title: "Inteligentna Kontrola",
      description:
        "Reguluj prędkość odtwarzania, dodawaj zakładki i wracaj do ulubionych fragmentów jednym kliknięciem.",
    },
    {
      icon: <Download className="w-8 h-8 text-purple-400" />,
      title: "Słuchaj Offline",
      description:
        "Pobierz audiobooki na swoje urządzenie i słuchaj ich bez połączenia z internetem.",
    },
  ];

  const testimonials = [
    {
      name: "Anna Kowalska",
      avatar: "AK",
      text: "Fantastyczna aplikacja! Słucham audiobooków w drodze do pracy każdego dnia. Interfejs jest intuicyjny, a jakość nagrań rewelacyjna.",
      rating: 5,
      role: "Miłośniczka literatury",
    },
    {
      name: "Piotr Nowak",
      avatar: "PN",
      text: "Ogromny wybór książek i świetna jakość nagrań. Funkcja offline to strzał w dziesiątkę - mogę słuchać nawet w metrze!",
      rating: 5,
      role: "Przedsiębiorca",
    },
    {
      name: "Maria Wiśniewska",
      avatar: "MW",
      text: "Intuicyjny interfejs i wygodne funkcje. Idealnie dla osób, które chcą wykorzystać czas w podróży na rozwój osobisty.",
      rating: 5,
      role: "Studentka",
    },
  ];

  const stats = [
    {
      number: "1000+",
      label: "Audiobooków",
      icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    },
    {
      number: "50+",
      label: "Autorów",
      icon: <Users className="w-6 h-6 text-emerald-400" />,
    },
    {
      number: "24/7",
      label: "Dostępność",
      icon: <Clock className="w-6 h-6 text-amber-400" />,
    },
    {
      number: "HD",
      label: "Jakość Audio",
      icon: <Award className="w-6 h-6 text-purple-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Audit
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center space-x-2 px-4 py-2 text-white/80 hover:text-white border border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                <span>Zaloguj się</span>
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-4 h-4" />
                <span>Zarejestruj się</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/20 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-white/80 border border-white/20 rounded-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>Zaloguj się</span>
              </button>
              <button
                onClick={() => navigate("/register")}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>Zarejestruj się</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div
            className={`text-center transform transition-all duration-1000 ${
              animateIn
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Twoje Audiobooki,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Zawsze Pod Ręką
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Odkryj tysiące audiobooków, słuchaj swoich ulubionych autorów i
              zanurz się w świat literatury
              <span className="text-blue-300"> gdzie tylko chcesz</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => navigate("/register")}
                className="group flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Zacznij Słuchać Za Darmo</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center space-x-2 px-8 py-4 border-2 border-white/30 rounded-xl text-lg hover:border-white/50 hover:bg-white/5 transition-all duration-300"
              >
                <User className="w-5 h-5" />
                <span>Mam już konto</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white/60 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Dlaczego <span className="text-blue-400">Audit</span>?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Poznaj funkcje, które czynią nas wyjątkowymi w świecie audiobooków
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Co <span className="text-emerald-400">Mówią</span> Nasi
              Użytkownicy
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Prawdziwe opinie od prawdziwych miłośników audiobooków
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-500 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-white/60">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-current"
                    />
                  ))}
                </div>

                <p className="text-white/80 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Gotowy na <span className="text-blue-400">Przygodę</span>?
            </h2>

            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Dołącz do tysięcy słuchaczy i odkryj magię audiobooków już dziś!
              Twoja literacka podróż zaczyna się tutaj.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="group inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/30"
            >
              <Headphones className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Rozpocznij Za Darmo</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/50">
            © 2024 Audit. Wszystkie prawa zastrzeżone. Stworzone z ❤️ dla
            miłośników audiobooków.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
