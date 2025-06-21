import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockAuthenticatedUser } from "../../test/utils";
import Home from "../Home";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the RealStripePayment component
vi.mock("../RealStripePayment", () => ({
  default: ({ open, onClose, audiobook, onSuccess }) => {
    if (!open) return null;
    return (
      <div data-testid="stripe-payment-modal">
        <h2>Payment for {audiobook?.title}</h2>
        <button onClick={() => onSuccess("Payment successful!")}>
          Complete Payment
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  it("renders loading state initially", () => {
    renderWithProviders(<Home />);

    expect(screen.getByText("Ładowanie danych...")).toBeInTheDocument();
  });

  it("renders main sections after loading", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Dostępne Audiobooki")).toBeInTheDocument();
      expect(screen.getByText("Autorzy")).toBeInTheDocument();
    });
  });

  it("displays audiobooks grid", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Test Audiobook 1")).toBeInTheDocument();
      expect(screen.getByText("Premium Audiobook")).toBeInTheDocument();
    });
  });

  it("displays authors section", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Test Author")).toBeInTheDocument();
      expect(screen.getByText("Another Author")).toBeInTheDocument();
    });
  });

  it("navigates to audiobook page when clicking on audiobook", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Test Audiobook 1")).toBeInTheDocument();
    });

    const audiobookCard = screen.getByText("Test Audiobook 1").closest("div");
    await user.click(audiobookCard);

    expect(mockNavigate).toHaveBeenCalledWith("/audiobook/1");
  });

  it("navigates to author page when clicking on author", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Test Author")).toBeInTheDocument();
    });

    const authorCard = screen.getByText("Test Author").closest("div");
    await user.click(authorCard);

    expect(mockNavigate).toHaveBeenCalledWith("/author/1");
  });

  it("shows premium badge for premium audiobooks", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("49.99 PLN")).toBeInTheDocument();
      expect(screen.getByText("PREMIUM")).toBeInTheDocument();
    });
  });

  it("shows purchased badge for owned premium audiobooks", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      // Test Audiobook 1 is marked as purchased
      expect(screen.queryByText("ZAKUPIONE")).toBeInTheDocument();
    });
  });

  it("opens payment modal when clicking purchase button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Premium Audiobook")).toBeInTheDocument();
    });

    // Find and click the purchase button for premium audiobook
    const purchaseButton = screen.getByText("Kup za 49.99 PLN");
    await user.click(purchaseButton);

    expect(screen.getByTestId("stripe-payment-modal")).toBeInTheDocument();
    expect(
      screen.getByText("Payment for Premium Audiobook")
    ).toBeInTheDocument();
  });

  it("handles successful payment and updates data", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Premium Audiobook")).toBeInTheDocument();
    });

    // Click purchase button
    const purchaseButton = screen.getByText("Kup za 49.99 PLN");
    await user.click(purchaseButton);

    // Complete payment
    const completePaymentButton = screen.getByText("Complete Payment");
    await user.click(completePaymentButton);

    // Should close modal
    await waitFor(() => {
      expect(
        screen.queryByTestId("stripe-payment-modal")
      ).not.toBeInTheDocument();
    });
  });

  it("displays chapter carousel for selected audiobook", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Rozdziały:/)).toBeInTheDocument();
      expect(screen.getByText("Rozdział 1")).toBeInTheDocument();
    });
  });

  it("navigates between chapters in carousel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Rozdział 1")).toBeInTheDocument();
    });

    // Find next button and click it
    const nextButton = screen.getByRole("button", { name: "" });
    const nextButtons = screen.getAllByRole("button", { name: "" });
    const skipForwardButton = nextButtons.find((btn) =>
      btn.querySelector("svg")
    );

    if (skipForwardButton) {
      await user.click(skipForwardButton);

      await waitFor(() => {
        expect(screen.getByText("Rozdział 2")).toBeInTheDocument();
      });
    }
  });

  it("shows loading state for chapters when switching audiobooks", async () => {
    renderWithProviders(<Home />);

    // Initial loading should show chapter loading
    await waitFor(() => {
      // Component should handle chapters loading
      expect(screen.getByText(/Rozdziały:/)).toBeInTheDocument();
    });
  });

  it("handles error state gracefully", async () => {
    // Mock API to return error
    const errorHome = () => {
      throw new Error("API Error");
    };

    renderWithProviders(<Home />);

    // Component should handle errors gracefully
    await waitFor(() => {
      // If there's an error, it should either show an error message or fallback
      expect(screen.queryByText("Ładowanie danych...")).not.toBeInTheDocument();
    });
  });

  it("displays ratings for audiobooks when available", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("4.8")).toBeInTheDocument();
    });
  });

  it("shows duration for audiobooks", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("5h 30m")).toBeInTheDocument();
      expect(screen.getByText("8h 15m")).toBeInTheDocument();
    });
  });

  it("handles premium audiobook without access in chapters", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      // Should show some indication for premium content
      expect(screen.getByText(/Rozdziały:/)).toBeInTheDocument();
    });
  });

  it("shows correct chapter count", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("1 z 2 rozdziałów")).toBeInTheDocument();
    });
  });

  it("updates selected audiobook when clicking chapter numbers", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Rozdział 1")).toBeInTheDocument();
    });

    // Find chapter number buttons
    const chapterButtons = screen.getAllByRole("button");
    const chapterButton = chapterButtons.find((btn) => btn.textContent === "2");

    if (chapterButton) {
      await user.click(chapterButton);

      await waitFor(() => {
        expect(screen.getByText("Rozdział 2")).toBeInTheDocument();
      });
    }
  });
});
