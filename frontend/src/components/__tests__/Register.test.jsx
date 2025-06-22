// src/components/__tests__/Register.test.jsx - ZASTĄP zawartość
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"; // DODANO afterEach
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  mockUnauthenticatedUser,
} from "../../../test/utils";
import Register from "../Register";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AxiosInstance - POPRAWIONA STRUKTURA
vi.mock("../AxiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticatedUser();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders registration form correctly", () => {
    renderWithProviders(<Register />);

    // Sprawdź czy formularz się renderuje
    expect(document.querySelector("form")).toBeTruthy();

    // Sprawdź czy są potrzebne inputy
    const inputs = document.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(2); // Przynajmniej email i hasło
  });

  it("has required form elements", () => {
    renderWithProviders(<Register />);

    // Sprawdź przycisk submit
    const submitButton =
      document.querySelector('button[type="submit"]') ||
      document.querySelector("button");
    expect(submitButton).toBeTruthy();

    // Sprawdź czy są inputy
    const emailInput = document.querySelector(
      'input[type="email"], input[name="email"]'
    );
    const passwordInputs = document.querySelectorAll(
      'input[type="password"], input[name*="password"]'
    );

    expect(emailInput).toBeTruthy();
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
  });
});
