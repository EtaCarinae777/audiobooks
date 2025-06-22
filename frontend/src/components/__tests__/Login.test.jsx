// src/components/__tests__/Login.test.jsx - ZASTĄP zawartość
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  mockUnauthenticatedUser,
} from "../../../test/utils";
import Login from "../Login";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AxiosInstance
vi.mock("../AxiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticatedUser();
  });

  it("renders login form correctly", () => {
    renderWithProviders(<Login />);

    // Sprawdź czy formularz się renderuje
    expect(document.querySelector("form")).toBeTruthy();

    // Sprawdź czy są inputy email i hasło
    const emailInput = document.querySelector(
      'input[type="email"], input[name="email"]'
    );
    const passwordInput = document.querySelector(
      'input[type="password"], input[name="password"]'
    );

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  it("has login button", () => {
    renderWithProviders(<Login />);

    const button =
      document.querySelector('button[type="submit"]') ||
      document.querySelector("button");
    expect(button).toBeTruthy();
  });

  it("renders login title", () => {
    renderWithProviders(<Login />);

    // Sprawdź czy jest jakiś tekst związany z logowaniem
    const title =
      document.querySelector(".login-title") ||
      document.querySelector("h1") ||
      document.querySelector("h2");
    expect(title).toBeTruthy();
  });
});
