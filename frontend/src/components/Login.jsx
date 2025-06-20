import "../App.css";
import MyTextField from "./forms/MyTextField.jsx";
import PasswordField from "./forms/PasswordField.jsx";
import MyButton from "./forms/MyButton.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AxiosInstance from "./AxiosInstance";
import { ArrowLeft, BookOpen, AlertTriangle } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const { handleSubmit, control } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submission = async (data) => {
    setLoading(true);
    setError("");

    try {
      const response = await AxiosInstance.post("login/", {
        email: data.email,
        password: data.password,
      });

      console.log(response);
      // Zapisuje token w localStorage
      localStorage.setItem("Token", response.data.token);
      // Po zalogowaniu przekierowuje do home
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
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

      <form onSubmit={handleSubmit(submission)}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-500 min-w-[400px] w-full max-w-md relative z-10">
          <div className="flex justify-center items-center w-full bg-transparent mb-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Audit
                </h1>
              </div>
              <h2 className="text-3xl font-bold text-white text-center">
                Zaloguj się
              </h2>
            </div>
          </div>

          {error && (
            <div className="flex justify-center items-center w-full bg-transparent mb-6 relative">
              <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center items-center w-full bg-transparent mb-6 relative">
            <MyTextField label={"Email"} name={"email"} control={control} />
          </div>

          <div className="flex justify-center items-center w-full bg-transparent mb-6 relative">
            <PasswordField
              label={"Hasło"}
              name={"password"}
              control={control}
            />
          </div>

          <div className="flex justify-center items-center w-full bg-transparent mb-6 relative">
            <MyButton
              type={"submit"}
              label={loading ? "Logowanie..." : "Zaloguj się"}
              disabled={loading}
            />
          </div>

          <div className="flex justify-center items-center w-full bg-transparent mb-6 relative">
            <Link
              to="/register"
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium hover:underline no-underline"
            >
              Nie masz konta? Zarejestruj się!
            </Link>
          </div>

          <div className="flex justify-center items-center w-full bg-transparent mb-2 relative">
            <Link
              to="/"
              className="text-white/60 hover:text-white/80 transition-colors text-sm no-underline flex items-center space-x-1 group"
              style={{ fontSize: "0.9rem", opacity: 0.8 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Powrót na stronę główną</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
