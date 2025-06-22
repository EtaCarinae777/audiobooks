import "@testing-library/jest-dom";
import { vi } from "vitest";

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

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// UNIWERSALNY MOCK dla WSZYSTKICH ikon MUI
vi.mock("@mui/icons-material", () => {
  const mockIcon = () => '<div data-testid="mui-icon">Icon</div>';

  // Używamy Proxy żeby obsłużyć WSZYSTKIE możliwe ikony automatycznie
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === "__esModule") return true;
        if (prop === "default") return mockIcon;
        return mockIcon;
      },
    }
  );
});

// UNIWERSALNY MOCK dla komponentów Material-UI
vi.mock("@mui/material", () => {
  const mockComponent = ({ children }) =>
    children || "<div>Mock Component</div>";

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === "__esModule") return true;
        if (prop === "default") return mockComponent;

        // Specjalne przypadki dla komponentów, które zwracają HTML
        if (prop === "Button")
          return ({ children }) =>
            `<button data-testid="mui-button">${children}</button>`;
        if (prop === "TextField")
          return () => `<input data-testid="mui-textfield" />`;
        if (prop === "IconButton")
          return ({ children }) =>
            `<button data-testid="mui-icon-button">${children}</button>`;
        if (prop === "Slider")
          return () => `<input type="range" data-testid="mui-slider" />`;
        if (prop === "CircularProgress")
          return () => '<div data-testid="mui-loading">Loading...</div>';
        if (prop === "LinearProgress")
          return () => '<div data-testid="mui-progress">Progress...</div>';

        // Dla wszystkich innych komponentów - po prostu zwróć children
        return mockComponent;
      },
    }
  );
});
