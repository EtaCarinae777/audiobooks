import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AudioPlayerProvider } from "../components/context/AudioPlayerContext";

// Mock Stripe
const stripePromise = Promise.resolve({
  elements: () => ({
    create: () => ({
      mount: () => {},
      destroy: () => {},
      on: () => {},
      update: () => {},
    }),
    getElement: () => ({}),
  }),
  confirmCardPayment: () =>
    Promise.resolve({
      paymentIntent: { status: "succeeded", id: "pi_test" },
    }),
});

// Custom render function that includes all providers
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    route = "/",
    ...renderOptions
  } = {}
) {
  // Set up the initial route
  window.history.pushState({}, "Test page", route);

  function Wrapper({ children }) {
    return (
      <GoogleOAuthProvider clientId="test-client-id">
        <Elements stripe={stripePromise}>
          <BrowserRouter>
            <AudioPlayerProvider>{children}</AudioPlayerProvider>
          </BrowserRouter>
        </Elements>
      </GoogleOAuthProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Mock functions for common use cases
export const mockLocalStorage = (initialValues = {}) => {
  const store = { ...initialValues };

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Mock authenticated user
export const mockAuthenticatedUser = () => {
  const mockStorage = mockLocalStorage({ Token: "mock-auth-token" });
  Object.defineProperty(window, "localStorage", {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
};

// Mock unauthenticated user
export const mockUnauthenticatedUser = () => {
  const mockStorage = mockLocalStorage();
  Object.defineProperty(window, "localStorage", {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
};

// Wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock audio context
export const mockAudioContext = () => {
  global.AudioContext = class MockAudioContext {
    constructor() {
      this.state = "running";
    }
    createMediaElementSource() {
      return {
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
    createGain() {
      return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        gain: { value: 1 },
      };
    }
    get destination() {
      return {
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
  };

  global.webkitAudioContext = MockAudioContext;
};

// Re-export everything
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
