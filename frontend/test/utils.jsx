// test/utils.jsx - zastąp całą zawartość
import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // DODAJ TO
import { AudioPlayerProvider } from "../src/components/context/AudioPlayerContext";
import { vi } from "vitest";

export const mockAuthenticatedUser = () => {
  const mockStorage = {
    getItem: vi.fn(() => "mock-token"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, "localStorage", {
    value: mockStorage,
    writable: true,
  });
};

export const mockUnauthenticatedUser = () => {
  const mockStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, "localStorage", {
    value: mockStorage,
    writable: true,
  });
};

// NAJWAŻNIEJSZA ZMIANA - dodaj GoogleOAuthProvider
const AllTheProviders = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId="test-client-id">
      <BrowserRouter>
        <AudioPlayerProvider>{children}</AudioPlayerProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export const renderWithProviders = (ui, options = {}) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from "@testing-library/react";
