import "../App.css";
import Box from "@mui/material/Box";
import MyTextField from "./forms/MyTextField.jsx";
import PasswordField from "./forms/PasswordField.jsx";
import MyButton from "./forms/MyButton.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AxiosInstance from "./AxiosInstance";
import { useState, useEffect } from "react";
import { IconButton, Typography, Alert } from "@mui/material";
import { ArrowBack, MenuBook } from "@mui/icons-material";

const Register = () => {
  const navigate = useNavigate();
  const { handleSubmit, control, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState(""); // '', 'checking', 'available', 'taken'

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
        return { text: "Sprawdzam dostępność...", color: "#ff9800" };
      case "available":
        return { text: "✓ Email dostępny", color: "#4caf50" };
      case "taken":
        return { text: "✗ Email już zarejestrowany", color: "#f44336" };
      default:
        return null;
    }
  };

  const emailStatusInfo = getEmailStatusMessage();

  return (
    <div className={"myBackground"}>
      {/* Back button */}
      <IconButton
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.2)",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
          zIndex: 10,
        }}
      >
        <ArrowBack />
      </IconButton>

      <form onSubmit={handleSubmit(submission)}>
        <Box className={"whiteBox"}>
          <Box className={"itemBox"}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <MenuBook
                sx={{
                  fontSize: "2rem",
                  color: "#667eea",
                  mr: 1,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #667eea, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Audit
              </Typography>
            </Box>
            <Box className={"title"}>Załóż konto</Box>
          </Box>

          {message && (
            <Box className={"itemBox"}>
              <Alert
                severity={message.includes("Błąd") ? "error" : "success"}
                sx={{
                  background: message.includes("Błąd")
                    ? "rgba(244, 67, 54, 0.1)"
                    : "rgba(76, 175, 80, 0.1)",
                  color: message.includes("Błąd") ? "#ef4444" : "#22c55e",
                  border: message.includes("Błąd")
                    ? "1px solid rgba(244, 67, 54, 0.3)"
                    : "1px solid rgba(76, 175, 80, 0.3)",
                }}
              >
                {message}
                {message.includes("pomyślna") && (
                  <div style={{ marginTop: "10px" }}>
                    <Link
                      to="/login"
                      style={{
                        color: "#1976d2",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Przejdź do logowania teraz
                    </Link>
                  </div>
                )}
              </Alert>
            </Box>
          )}

          <Box className={"itemBox"}>
            <MyTextField label={"Email"} name={"email"} control={control} />
            {/* Email status */}
            {emailStatusInfo && (
              <div
                style={{
                  fontSize: "12px",
                  color: emailStatusInfo.color,
                  marginTop: "5px",
                  textAlign: "left",
                }}
              >
                {emailStatusInfo.text}
              </div>
            )}
          </Box>

          <Box className={"itemBox"}>
            <PasswordField
              label={"Hasło"}
              name={"password"}
              control={control}
            />
          </Box>
          <Box className={"itemBox"}>
            <PasswordField
              label={"Potwierdź hasło"}
              name={"password2"}
              control={control}
            />
          </Box>
          <Box className={"itemBox"}>
            <MyButton
              type={"submit"}
              label={loading ? "Rejestracja..." : "Zarejestruj się"}
              disabled={loading || emailStatus === "taken"}
            />
          </Box>
          <Box className={"itemBox"}>
            <Link to="/login" className={"myLink"}>
              Masz już konto? Zaloguj się
            </Link>
          </Box>
          <Box className={"itemBox"}>
            <Link
              to="/"
              className={"myLink"}
              style={{ fontSize: "0.9rem", opacity: 0.8 }}
            >
              ← Powrót na stronę główną
            </Link>
          </Box>
        </Box>
      </form>
    </div>
  );
};

export default Register;
