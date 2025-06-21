import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockUnauthenticatedUser } from "../../test/utils";
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

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticatedUser();
  });

  it("renders login form correctly", () => {
    renderWithProviders(<Login />);

    const buttons = screen.getAllByText("Zaloguj się");
    expect(buttons.length).toBeGreaterThan(0);
    expect(
      screen.getByText("Witaj ponownie! Cieszymy się, że wracasz.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/adres email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zaloguj się/i })
    ).toBeInTheDocument();
  });

  it("displays validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email jest wymagany")).toBeInTheDocument();
      expect(screen.getByText("Hasło jest wymagane")).toBeInTheDocument();
    });
  });

  it("displays validation error for short password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const passwordInput = screen.getByLabelText(/hasło/i);
    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

    await user.type(passwordInput, "123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Hasło musi mieć co najmniej 6 znaków")
      ).toBeInTheDocument();
    });
  });

  it("displays error message for invalid credentials", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/adres email/i);
    const passwordInput = screen.getByLabelText(/hasło/i);
    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Wystąpił błąd podczas logowania")
      ).toBeInTheDocument();
    });
  });

  it("navigates to register page when clicking register link", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const registerLink = screen.getByText("Nie masz konta? Zarejestruj się!");
    await user.click(registerLink);

    // Since we're using Link component, this would normally change the route
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("displays Google login button", () => {
    renderWithProviders(<Login />);

    // Google login button is rendered by @react-oauth/google
    expect(screen.getByText("Szybkie logowanie")).toBeInTheDocument();
    expect(screen.getByText("lub kontynuuj z emailem")).toBeInTheDocument();
  });

  it("stores token in localStorage on successful login", async () => {
    const user = userEvent.setup();
    const mockStorage = mockUnauthenticatedUser();
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/adres email/i);
    const passwordInput = screen.getByLabelText(/hasło/i);
    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "Token",
        "mock-auth-token"
      );
    });
  });
});
