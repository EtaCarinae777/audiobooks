// frontend/src/components/RealStripePayment.jsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { Lock, CheckCircle, Error, CreditCard } from "@mui/icons-material";
import AxiosInstance from "./AxiosInstance.jsx";

// Styl dla Stripe Card Element
const cardStyle = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "rgba(255, 255, 255, 0.6)",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

// Komponent formularza płatności
const CheckoutForm = ({ audiobook, onSuccess, onError, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);

    try {
      // Potwierdź płatność przez Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === "succeeded") {
        // Powiadom backend o sukcesie płatności
        const response = await AxiosInstance.post("/payments/confirm/", {
          payment_intent_id: paymentIntent.id,
        });

        onSuccess(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Wystąpił błąd podczas płatności");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, background: "rgba(244, 67, 54, 0.1)", color: "white" }}
          icon={<Error sx={{ color: "#ef4444" }} />}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 3,
          p: 2,
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <CreditCard sx={{ mr: 1, color: "rgba(255, 255, 255, 0.7)" }} />
          <Typography
            variant="subtitle2"
            sx={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            Dane karty kredytowej
          </Typography>
        </Box>
        <CardElement options={cardStyle} />
      </Box>

      {/* Testowe karty */}
      <Alert
        severity="info"
        sx={{
          mb: 3,
          background: "rgba(59, 130, 246, 0.1)",
          color: "rgba(147, 197, 253, 1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Testowe karty Stripe:</strong>
        </Typography>
        <Typography variant="body2" component="div">
          • <strong>4242 4242 4242 4242</strong> - zawsze sukces
          <br />• <strong>4000 0000 0000 0002</strong> - karta odrzucona
          <br />• <strong>4000 0000 0000 9995</strong> - niewystarczające środki
          <br />• Data: dowolna przyszła • CVC: dowolne 3 cyfry
        </Typography>
      </Alert>

      <Button
        type="submit"
        disabled={!stripe || loading}
        variant="contained"
        fullWidth
        sx={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "white",
          py: 1.5,
          fontSize: "1.1rem",
          fontWeight: "bold",
          "&:hover": {
            background: "linear-gradient(135deg, #059669, #047857)",
          },
          "&:disabled": {
            background: "rgba(156, 163, 175, 0.3)",
          },
        }}
      >
        {loading ? (
          <Box display="flex" alignItems="center">
            <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
            Przetwarzanie płatności...
          </Box>
        ) : (
          `Zapłać ${audiobook.price} PLN`
        )}
      </Button>
    </form>
  );
};

// Główny komponent
const RealStripePayment = ({ open, onClose, audiobook, onSuccess }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Pobierz konfigurację Stripe
    console.log("🔧 getStripeConfig useEffect triggered, open:", open);
    const getStripeConfig = async () => {
      try {
        const response = await AxiosInstance.get("/payments/config/");
        const stripe = await loadStripe(response.data.publishable_key);
        setStripePromise(stripe);
      } catch (error) {
        setError("Nie udało się załadować systemu płatności");
      }
    };

    if (open) {
      getStripeConfig();
    }
  }, [open]);

  useEffect(() => {
    // Utwórz PaymentIntent gdy dialog się otwiera
    const createPaymentIntent = async () => {
      if (!audiobook || !open) return;

      try {
        setLoading(true);
        console.log(
          "📡 About to send POST request to:",
          "/payments/create-intent/"
        );
        const response = await AxiosInstance.post("/payments/create-intent/", {
          audiobook_id: audiobook.id,
        });
        setClientSecret(response.data.client_secret);
      } catch (error) {
        setError(
          error.response?.data?.error || "Nie udało się utworzyć płatności"
        );
      } finally {
        setLoading(false);
      }
    };
    if (open && stripePromise) {
      createPaymentIntent();
    }
  }, [open, audiobook, stripePromise]);

  const handleSuccess = (message) => {
    onSuccess(message);
    onClose();
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleClose = () => {
    setClientSecret("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background:
            "linear-gradient(135deg, rgba(15, 29, 77, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
        },
      }}
    >
      <DialogTitle sx={{ color: "white", pb: 1 }}>
        <Box display="flex" alignItems="center">
          <Lock sx={{ mr: 1, color: "#10b981" }} />
          Płatność przez Stripe
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Informacje o audiobooku */}
        <Card
          sx={{
            mb: 3,
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
              {audiobook.title}
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 2 }}>
              {audiobook.author_name}
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h5"
                sx={{ color: "#10b981", fontWeight: "bold" }}
              >
                {audiobook.price} PLN
              </Typography>
              <Chip
                label="PREMIUM"
                icon={<CheckCircle />}
                sx={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "white",
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, background: "rgba(244, 67, 54, 0.1)", color: "white" }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ py: 4 }}
          >
            <CircularProgress sx={{ color: "#10b981" }} />
            <Typography sx={{ ml: 2, color: "white" }}>
              Przygotowywanie płatności...
            </Typography>
          </Box>
        ) : stripePromise && clientSecret ? (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              audiobook={audiobook}
              onSuccess={handleSuccess}
              onError={handleError}
              clientSecret={clientSecret}
            />
          </Elements>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleClose}
          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          Anuluj
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RealStripePayment;
