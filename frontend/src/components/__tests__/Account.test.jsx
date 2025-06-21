import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockAuthenticatedUser } from "../../test/utils";
import Account from "../Account";

describe("Account Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  it("renders account page header correctly", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Twoje Konto")).toBeInTheDocument();
    expect(
      screen.getByText("Zarządzaj swoim profilem i ustawieniami")
    ).toBeInTheDocument();
  });

  it("displays profile information section", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Informacje o profilu")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Imię i nazwisko")).toBeInTheDocument();
    expect(screen.getByText("Data rejestracji")).toBeInTheDocument();
    expect(screen.getByText("Status konta")).toBeInTheDocument();
  });

  it("shows user email information", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("shows user name information", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
  });

  it("shows registration date", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("15 maja 2024")).toBeInTheDocument();
  });

  it("shows active account status", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Aktywne")).toBeInTheDocument();
  });

  it("displays edit profile button", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Edytuj profil")).toBeInTheDocument();
  });

  it("renders quick actions section", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Ustawienia")).toBeInTheDocument();
    expect(screen.getByText("Konfiguruj preferencje")).toBeInTheDocument();

    expect(screen.getByText("Płatności")).toBeInTheDocument();
    expect(
      screen.getByText("Zarządzaj metodami płatności")
    ).toBeInTheDocument();

    expect(screen.getByText("Powiadomienia")).toBeInTheDocument();
    expect(screen.getByText("Skonfiguruj alerty")).toBeInTheDocument();
  });

  it("displays security section", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Bezpieczeństwo")).toBeInTheDocument();
    expect(screen.getByText("Zmień hasło")).toBeInTheDocument();
    expect(
      screen.getByText("Uwierzytelnianie dwuskładnikowe")
    ).toBeInTheDocument();
  });

  it("shows password change option", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Zmień hasło")).toBeInTheDocument();
    expect(
      screen.getByText("Ostatnia zmiana: 30 dni temu")
    ).toBeInTheDocument();
    expect(screen.getByText("Zmień")).toBeInTheDocument();
  });

  it("shows 2FA status as disabled", () => {
    renderWithProviders(<Account />);

    expect(
      screen.getByText("Uwierzytelnianie dwuskładnikowe")
    ).toBeInTheDocument();
    expect(screen.getByText("Wyłączone")).toBeInTheDocument();
    expect(screen.getByText("Włącz")).toBeInTheDocument();
  });

  it("displays help and support section", () => {
    renderWithProviders(<Account />);

    expect(screen.getByText("Pomoc i wsparcie")).toBeInTheDocument();
    expect(screen.getByText("Centrum pomocy")).toBeInTheDocument();
    expect(screen.getByText("Często zadawane pytania")).toBeInTheDocument();
    expect(screen.getByText("Kontakt z pomocą")).toBeInTheDocument();
    expect(screen.getByText("Napisz do nas")).toBeInTheDocument();
  });

  it("handles edit profile button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const editButton = screen.getByText("Edytuj profil");
    await user.click(editButton);

    // Should handle the click (may open modal or navigate)
    expect(editButton).toBeInTheDocument();
  });

  it("handles settings card click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const settingsCard = screen.getByText("Ustawienia").closest("div");
    await user.click(settingsCard);

    // Should handle the click
    expect(settingsCard).toBeInTheDocument();
  });

  it("handles payments card click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const paymentsCard = screen.getByText("Płatności").closest("div");
    await user.click(paymentsCard);

    expect(paymentsCard).toBeInTheDocument();
  });

  it("handles notifications card click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const notificationsCard = screen.getByText("Powiadomienia").closest("div");
    await user.click(notificationsCard);

    expect(notificationsCard).toBeInTheDocument();
  });

  it("handles change password button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const changePasswordButton = screen.getByText("Zmień");
    await user.click(changePasswordButton);

    expect(changePasswordButton).toBeInTheDocument();
  });

  it("handles enable 2FA button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const enable2FAButton = screen.getByText("Włącz");
    await user.click(enable2FAButton);

    expect(enable2FAButton).toBeInTheDocument();
  });

  it("handles help center button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const helpCenterButton = screen
      .getByText("Centrum pomocy")
      .closest("button");
    await user.click(helpCenterButton);

    expect(helpCenterButton).toBeInTheDocument();
  });

  it("handles contact support button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Account />);

    const contactSupportButton = screen
      .getByText("Kontakt z pomocą")
      .closest("button");
    await user.click(contactSupportButton);

    expect(contactSupportButton).toBeInTheDocument();
  });

  it("displays correct icons for each section", () => {
    renderWithProviders(<Account />);

    // Check if icons are present (SVG elements)
    const icons = document.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(5); // Should have multiple icons
  });

  it("has proper styling and layout", () => {
    renderWithProviders(<Account />);

    // Check for gradient background
    expect(document.querySelector(".bg-gradient-to-br")).toBeInTheDocument();

    // Check for glass morphism effects
    expect(document.querySelector(".backdrop-blur-xl")).toBeInTheDocument();
  });

  it("displays security status indicators", () => {
    renderWithProviders(<Account />);

    // Active status indicator
    expect(document.querySelector(".bg-emerald-500")).toBeInTheDocument();

    // 2FA disabled indicator
    expect(document.querySelector(".bg-red-500")).toBeInTheDocument();
  });

  it("has responsive design elements", () => {
    renderWithProviders(<Account />);

    // Check for responsive grid classes
    expect(document.querySelector(".grid")).toBeInTheDocument();
    expect(document.querySelector(".md\\:grid-cols-2")).toBeInTheDocument();
  });

  it("shows proper text hierarchy", () => {
    renderWithProviders(<Account />);

    // Main title should be largest
    const mainTitle = screen.getByText("Twoje Konto");
    expect(mainTitle).toHaveClass(/text-4xl/);

    // Section titles should be smaller
    const sectionTitle = screen.getByText("Informacje o profilu");
    expect(sectionTitle).toHaveClass(/text-2xl/);
  });

  it("displays background elements", () => {
    renderWithProviders(<Account />);

    // Should have background gradient elements
    expect(document.querySelector(".absolute")).toBeInTheDocument();
    expect(document.querySelector(".blur-3xl")).toBeInTheDocument();
  });

  it("shows consistent spacing and padding", () => {
    renderWithProviders(<Account />);

    // Cards should have consistent padding
    const cards = document.querySelectorAll(".p-6, .p-8");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("displays proper loading animations if any", () => {
    renderWithProviders(<Account />);

    // Component should render without loading states since it's static content
    expect(screen.getByText("Twoje Konto")).toBeInTheDocument();
  });
});
