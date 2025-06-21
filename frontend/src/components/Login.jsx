import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import AxiosInstance from "./AxiosInstance";
import {
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import { useState } from "react";

const Login = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Normalne logowanie
  const submission = async (data) => {
    setLoading(true);
    setError("");

    try {
      const response = await AxiosInstance.post("login/", {
        email: data.email,
        password: data.password,
      });

      console.log(response);
      localStorage.setItem("Token", response.data.token);
      navigate("/home");
    } catch (error) {
      console.error("There was an error logging in!", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 400) {
        setError("Nieprawidłowy email lub hasło");
      } else {
        setError("Wystąpił błąd podczas logowania");
      }
    } finally {
      setLoading(false);
    }
  };

  // Logowanie przez Google - ZMIEŃ ENDPOINT:
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      // ZMIEŃ NA TWÓJ ENDPOINT:
      const response = await AxiosInstance.post("auth/google/", {
        token: credentialResponse.credential,
      });

      console.log("Google login success:", response);
      localStorage.setItem("Token", response.data.token);
      navigate("/home");
    } catch (error) {
      console.error("Google login error:", error);
      setError("Błąd podczas logowania przez Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Logowanie przez Google zostało anulowane");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements - jak wcześniej */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Przycisk powrotu */}
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
            <h2 className="text-3xl font-bold text-white">Zaloguj się</h2>
            <p className="text-white/70">
              Witaj ponownie! Cieszymy się, że wracasz.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">
                  Szybkie logowanie
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">
                  lub kontynuuj z emailem
                </span>
              </div>
            </div>
          </div>

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Logowanie...</span>
              </>
            ) : (
              <span>Zaloguj się</span>
            )}
          </button>

          {/* Links */}
          <div className="space-y-4 text-center">
            <Link
              to="/register"
              className="block text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium hover:underline"
            >
              Nie masz konta? Zarejestruj się!
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
            Bezpieczne logowanie z pełnym szyfrowaniem danych
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
