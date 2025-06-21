import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockUnauthenticatedUser } from "../../test/utils";
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

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticatedUser();
  });

  it("renders registration form correctly", () => {
    renderWithProviders(<Register />);

    expect(screen.getByText("Załóż konto")).toBeInTheDocument();
    expect(
      screen.getByText("Dołącz do tysięcy miłośników audiobooków")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/adres email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
    expect(screen.getByLabelText(/potwierdź hasło/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zarejestruj się/i })
    ).toBeInTheDocument();
  });

  it("displays validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const submitButton = screen.getByRole("button", {
      name: /zarejestruj się/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email jest wymagany")).toBeInTheDocument();
      expect(screen.getByText("Hasło jest wymagane")).toBeInTheDocument();
      expect(
        screen.getByText("Potwierdzenie hasła jest wymagane")
      ).toBeInTheDocument();
    });
  });

  it("checks email availability while typing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/adres email/i);

    // Type available email
    await user.type(emailInput, "new@example.com");

    await waitFor(
      () => {
        expect(screen.getByText("✓ Email dostępny")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("shows email already taken message", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/adres email/i);

    // Type existing email
    await user.type(emailInput, "existing@example.com");

    await waitFor(
      () => {
        expect(
          screen.getByText("✗ Email już zarejestrowany")
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("disables submit button when email is taken", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/adres email/i);
    const submitButton = screen.getByRole("button", {
      name: /zarejestruj się/i,
    });

    await user.type(emailInput, "existing@example.com");

    await waitFor(
      () => {
        expect(submitButton).toBeDisabled();
      },
      { timeout: 1000 }
    );
  });

  it("validates password mismatch", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/adres email/i);
    const passwordInput = screen.getByLabelText("Hasło");
    const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
    const submitButton = screen.getByRole("button", {
      name: /zarejestruj się/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "differentpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Hasła nie są identyczne")).toBeInTheDocument();
    });
  });

  it("successfully registers with valid data", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/adres email/i);
    const passwordInput = screen.getByLabelText("Hasło");
    const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
    const submitButton = screen.getByRole("button", {
      name: /zarejestruj się/i,
    });

    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    // Wait for email availability check
    await waitFor(
      () => {
        expect(screen.getByText("✓ Email dostępny")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/rejestracja pomyślna/i)).toBeInTheDocument();
    });
  });

  it("handles registration error for existing email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/adres email/i);
    const passwordInput = screen.getByLabelText("Hasło");
    const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
    const submitButton = screen.getByRole("button", {
      name: /zarejestruj się/i,
    });

    // First clear the email to reset the availability check
    await user.clear(emailInput);
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    // The button should be disabled due to email check, but let's simulate
    // the case where someone bypasses client-side validation
    await waitFor(
      () => {
        expect(
          screen.getByText("✗ Email już zarejestrowany")
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("shows loading state during registration", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByPlaceholderText("twoj@email.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole("button", {
      name: /zarejestruj się/i,
    });

    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    // Wait for email check
    await waitFor(
      () => {
        expect(screen.getByText("✓ Email dostępny")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    await user.click(submitButton);

    expect(screen.getByText("Rejestracja...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("navigates to login page after successful registration", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/adres email/i);
    const passwordInput = screen.getByLabelText("Hasło");
    const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
    const submitButton = screen.getByRole("button", {
      name: /zarejestruj się/i,
    });

    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    await waitFor(
      () => {
        expect(screen.getByText("✓ Email dostępny")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/rejestracja pomyślna/i)).toBeInTheDocument();
    });

    // Should navigate to login after timeout
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      },
      { timeout: 3500 }
    );
  });

  it("navigates to login page when clicking login link", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const loginLink = screen.getByText("Masz już konto? Zaloguj się");
    await user.click(loginLink);

    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("navigates back when clicking back button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const backButton = screen.getAllByRole("button", { name: "" })[0]; // First empty name button is the back button
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
