import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll, vi, expect } from "vitest";
import { server } from "./mocks/server";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window functions
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock HTMLMediaElement
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  writable: true,
  value: vi.fn(),
});

// Mock window.fs for file reading
global.window = global.window || {};
global.window.fs = {
  readFile: vi.fn().mockResolvedValue(new Uint8Array()),
};

// Mock dla @stripe/stripe-js
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() =>
    Promise.resolve({
      elements: vi.fn(() => ({
        create: vi.fn(() => ({
          mount: vi.fn(),
          destroy: vi.fn(),
          on: vi.fn(),
          update: vi.fn(),
        })),
        getElement: vi.fn(),
      })),
      createToken: vi.fn(),
      createSource: vi.fn(),
      confirmCardPayment: vi.fn(),
      confirmCardSetup: vi.fn(),
      paymentRequest: vi.fn(),
      _registerWrapper: vi.fn(),
    })
  ),
}));

// Mock dla @stripe/react-stripe-js
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => children,
  CardElement: () => {
    const div = document.createElement("div");
    div.setAttribute("data-testid", "card-element");
    div.textContent = "Mocked CardElement";
    return div;
  },
  useStripe: () => ({
    confirmCardPayment: vi.fn(),
    createToken: vi.fn(),
    createSource: vi.fn(),
  }),
  useElements: () => ({
    getElement: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});
