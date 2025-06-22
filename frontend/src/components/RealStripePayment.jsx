import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Lock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  X,
  Loader,
  Crown,
} from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3">
          <CreditCard className="w-5 h-5 text-white/70" />
          <span className="text-white/80 font-medium">
            Dane karty kredytowej
          </span>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {/* Testowe karty */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <p className="text-blue-300 font-medium text-sm mb-2">
              Testowe karty Stripe:
            </p>
            <div className="space-y-1 text-blue-200 text-xs">
              <p>
                <strong>4242 4242 4242 4242</strong> - zawsze sukces
              </p>
              <p>
                <strong>4000 0000 0000 0002</strong> - karta odrzucona
              </p>
              <p>
                <strong>4000 0000 0000 9995</strong> - niewystarczające środki
              </p>
              <p>Data: dowolna przyszła • CVC: dowolne 3 cyfry</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Przetwarzanie płatności...</span>
          </>
        ) : (
          <span>Zapłać {audiobook.price} PLN</span>
        )}
      </button>
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Płatność przez Stripe
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informacje o audiobooku */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="flex items-start space-x-4">
              <img
                src={audiobook.cover_image || "/api/placeholder/80/80"}
                alt={audiobook.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  {audiobook.title}
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  {audiobook.author_name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-400">
                    {audiobook.price} PLN
                  </span>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-full">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-sm font-bold">
                      PREMIUM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader className="w-12 h-12 animate-spin text-emerald-400" />
              <p className="text-white/80">Przygotowywanie płatności...</p>
            </div>
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
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-white/10">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealStripePayment;
