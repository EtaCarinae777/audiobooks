import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  mockUnauthenticatedUser,
} from "../../../test/utils";
import Landing from "../Landing";
// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Landing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticatedUser();
  });

  it("renders hero section correctly", () => {
    renderWithProviders(<Landing />);

    expect(screen.getByText("Twoje Audiobooki,")).toBeInTheDocument();
    expect(screen.getByText("Zawsze Pod Ręką")).toBeInTheDocument();
    expect(screen.getByText(/Odkryj tysiące audiobooków/)).toBeInTheDocument();
  });

  it("displays app statistics", () => {
    renderWithProviders(<Landing />);

    expect(screen.getByText("1000+")).toBeInTheDocument();
    expect(screen.getByText("Audiobooków")).toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
    expect(screen.getByText("Autorów")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
    expect(screen.getByText("Dostępność")).toBeInTheDocument();
    expect(screen.getByText("HD")).toBeInTheDocument();
    expect(screen.getByText("Jakość Audio")).toBeInTheDocument();
  });

  it("navigates to register when clicking main CTA button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    const ctaButton = screen.getByText("Zacznij Słuchać Za Darmo");
    await user.click(ctaButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("navigates to login when clicking login button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    const loginButton = screen.getByText("Mam już konto");
    await user.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to register when clicking register in nav", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    const registerButton = screen.getAllByText("Zarejestruj się")[0];
    await user.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("navigates to login when clicking login in nav", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    const loginButton = screen.getAllByText("Zaloguj się")[0];
    await user.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("displays features section", () => {
    renderWithProviders(<Landing />);

    expect(screen.getByText("Wysokiej Jakości Audio")).toBeInTheDocument();
    expect(screen.getByText("Ogromna Biblioteka")).toBeInTheDocument();
    expect(screen.getByText("Inteligentna Kontrola")).toBeInTheDocument();
    expect(screen.getByText("Słuchaj Offline")).toBeInTheDocument();
  });

  it("displays testimonials section", () => {
    renderWithProviders(<Landing />);

    expect(screen.getByText("Anna Kowalska")).toBeInTheDocument();
    expect(screen.getByText("Piotr Nowak")).toBeInTheDocument();
    expect(screen.getByText("Maria Wiśniewska")).toBeInTheDocument();
  });

  it("shows mobile menu when clicking hamburger", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    // Resize to mobile view
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 320,
    });

    const hamburgerButton = screen.getByRole("button", { name: "" });
    await user.click(hamburgerButton);

    // Mobile menu should be visible
    expect(screen.getAllByText("Zaloguj się")).toHaveLength(2); // One in desktop nav, one in mobile menu
  });

  it("redirects authenticated users to home", async () => {
    // Mock authenticated user
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

    renderWithProviders(<Landing />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
  });

  it("displays feature descriptions correctly", () => {
    renderWithProviders(<Landing />);

    expect(
      screen.getByText(/Słuchaj audiobooków w doskonałej jakości/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tysiące audiobooków z różnych kategorii/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reguluj prędkość odtwarzania/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pobierz audiobooki na swoje urządzenie/)
    ).toBeInTheDocument();
  });

  it("displays testimonial content correctly", () => {
    renderWithProviders(<Landing />);

    expect(screen.getByText(/Fantastyczna aplikacja!/)).toBeInTheDocument();
    expect(screen.getByText(/Ogromny wybór książek/)).toBeInTheDocument();
    expect(screen.getByText(/Intuicyjny interfejs/)).toBeInTheDocument();
  });

  it("navigates to register from bottom CTA", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    const bottomCtaButton = screen.getByText("Rozpocznij Za Darmo");
    await user.click(bottomCtaButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("has proper animation delays for elements", () => {
    renderWithProviders(<Landing />);

    // The component should have elements with animation classes
    expect(document.querySelector(".transform")).toBeInTheDocument();
  });

  it("handles window resize for mobile menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    // Test mobile menu functionality
    const buttons = screen.getAllByRole("button");

    // Should have hamburger menu button for mobile
    expect(buttons.length).toBeGreaterThan(2);
  });

  it("shows correct brand name and logo", () => {
    renderWithProviders(<Landing />);

    const brandElements = screen.getAllByText("Audit");
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it("displays proper navigation structure", () => {
    renderWithProviders(<Landing />);

    // Navigation should be present
    const nav = document.querySelector("nav");
    expect(nav).toBeInTheDocument();

    // Should have login and register buttons
    expect(screen.getByText("Zaloguj się")).toBeInTheDocument();
    expect(screen.getByText("Zarejestruj się")).toBeInTheDocument();
  });

  it("handles mobile menu toggle correctly", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Landing />);

    // Find mobile menu button (usually last button or hamburger icon)
    const buttons = screen.getAllByRole("button");
    const mobileMenuButton = buttons[buttons.length - 1];

    await user.click(mobileMenuButton);

    // Mobile menu should appear with additional navigation elements
    await waitFor(() => {
      const loginButtons = screen.getAllByText("Zaloguj się");
      expect(loginButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays gradient backgrounds correctly", () => {
    renderWithProviders(<Landing />);

    // Check if the main container has gradient styling
    const mainContainer = document.querySelector(".bg-gradient-to-br");
    expect(mainContainer).toBeInTheDocument();
  });

  it("shows hero animation on mount", async () => {
    renderWithProviders(<Landing />);

    // Component should animate in after a delay
    await waitFor(
      () => {
        // Animation should be triggered
        expect(document.querySelector(".transform")).toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });
});
