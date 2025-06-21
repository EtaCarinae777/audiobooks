import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import AxiosInstance from "./AxiosInstance";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState(""); // '', 'checking', 'available', 'taken'
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const watchedEmail = watch("email"); // Watch email field changes

  // Check email availability when it changes
  useEffect(() => {
    const checkEmail = async () => {
      if (watchedEmail && watchedEmail.includes("@")) {
        setEmailStatus("checking");
        try {
          const response = await AxiosInstance.post("check-email/", {
            email: watchedEmail,
          });

          if (response.data.exists) {
            setEmailStatus("taken");
          } else {
            setEmailStatus("available");
          }
        } catch (error) {
          console.error("Error checking email:", error);
          setEmailStatus("");
        }
      } else {
        setEmailStatus("");
      }
    };

    // Delay 500ms to avoid sending requests on every keystroke
    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [watchedEmail]);

  const submission = async (data) => {
    setLoading(true);
    setMessage("");

    // Check if email is available
    if (emailStatus === "taken") {
      setMessage("Ten email jest już zarejestrowany. Wybierz inny email.");
      setLoading(false);
      return;
    }

    // Password validation
    if (data.password !== data.password2) {
      setMessage("Hasła nie są identyczne");
      setLoading(false);
      return;
    }

    try {
      await AxiosInstance.post("register/", {
        email: data.email,
        password: data.password,
      });

      setMessage(
        "Rejestracja pomyślna! Możesz się teraz zalogować. Przekierowuję..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (registerError) {
      console.error("Registration error:", registerError);

      if (registerError.response?.data?.email) {
        const emailError = registerError.response.data.email[0];
        if (
          emailError.includes("already exists") ||
          emailError.includes("unique")
        ) {
          setMessage(
            "Ten email jest już zarejestrowany. Spróbuj się zalogować."
          );
        } else {
          setMessage(`Błąd email: ${emailError}`);
        }
      } else if (registerError.response?.data?.password) {
        setMessage(`Błąd hasła: ${registerError.response.data.password[0]}`);
      } else {
        setMessage("Błąd rejestracji. Spróbuj ponownie.");
      }

      setLoading(false);
    }
  };

  const getEmailStatusMessage = () => {
    switch (emailStatus) {
      case "checking":
        return {
          text: "Sprawdzam dostępność...",
          color: "text-amber-400",
          icon: <Loader className="w-4 h-4 animate-spin" />,
        };
      case "available":
        return {
          text: "✓ Email dostępny",
          color: "text-emerald-400",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "taken":
        return {
          text: "✗ Email już zarejestrowany",
          color: "text-red-400",
          icon: <X className="w-4 h-4" />,
        };
      default:
        return null;
    }
  };

  const emailStatusInfo = getEmailStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 hover:scale-110 transition-all duration-300 z-10 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white" />
      </button>

      <form
        onSubmit={handleSubmit(submission)}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-500 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Audit
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-white">Załóż konto</h2>
            <p className="text-white/70">
              Dołącz do tysięcy miłośników audiobooków
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`${
                message.includes("Błąd") || message.includes("zarejestrowany")
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              } border rounded-xl p-4 flex items-start space-x-3`}
            >
              <AlertTriangle
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  message.includes("Błąd") || message.includes("zarejestrowany")
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    message.includes("Błąd") ||
                    message.includes("zarejestrowany")
                      ? "text-red-300"
                      : "text-emerald-300"
                  }`}
                >
                  {message}
                </p>
                {message.includes("pomyślna") && (
                  <Link
                    to="/login"
                    className="inline-block mt-2 text-blue-300 hover:text-blue-200 underline text-sm transition-colors"
                  >
                    Przejdź do logowania teraz
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Adres email
            </label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email jest wymagany",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Nieprawidłowy format email",
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="twoj@email.com"
                />
              )}
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
            {/* Email Status */}
            {emailStatusInfo && (
              <div
                className={`flex items-center space-x-2 text-sm ${emailStatusInfo.color}`}
              >
                {emailStatusInfo.icon}
                <span>{emailStatusInfo.text}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Hasło
            </label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Hasło jest wymagane",
                  minLength: {
                    value: 6,
                    message: "Hasło musi mieć co najmniej 6 znaków",
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Potwierdź hasło
            </label>
            <div className="relative">
              <Controller
                name="password2"
                control={control}
                rules={{
                  required: "Potwierdzenie hasła jest wymagane",
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type={showPassword2 ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPassword2 ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password2 && (
              <p className="text-red-400 text-sm">{errors.password2.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || emailStatus === "taken"}
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Rejestracja...</span>
              </>
            ) : (
              <span>Zarejestruj się</span>
            )}
          </button>

          {/* Links */}
          <div className="space-y-4 text-center">
            <Link
              to="/login"
              className="block text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium hover:underline"
            >
              Masz już konto? Zaloguj się
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center space-x-1 text-white/60 hover:text-white/80 transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Powrót na stronę główną</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            Rejestrując się, akceptujesz nasze warunki korzystania z serwisu
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
