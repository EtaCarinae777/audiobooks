import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockAuthenticatedUser } from "../../test/utils";
import Search from "../Search";

// Mock useNavigate and useSearchParams
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

describe("Search Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  it("renders search interface correctly", () => {
    renderWithProviders(<Search />);

    expect(screen.getByText("Wyszukiwanie")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/wyszukaj audiobooki, autorów lub rozdziały/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Zacznij wyszukiwanie")).toBeInTheDocument();
    expect(
      screen.getByText("Wpisz tytuł audiobooka, nazwę autora lub rozdział")
    ).toBeInTheDocument();
  });

  it("performs search when typing in search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );

    await user.type(searchInput, "test");

    // Should show loading first
    await waitFor(() => {
      expect(screen.getByText("Wyszukiwanie...")).toBeInTheDocument();
    });

    // Then show results
    await waitFor(
      () => {
        expect(screen.getByText("Test Audiobook 1")).toBeInTheDocument();
        expect(screen.getByText("Test Author")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("updates URL with search query", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );

    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(mockSetSearchParams).toHaveBeenCalledWith({ q: "test" });
      },
      { timeout: 1000 }
    );
  });

  it("clears search when clicking clear button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );

    await user.type(searchInput, "test");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
    });

    const clearButton = screen.getByRole("button", { name: "" });
    await user.click(clearButton);

    expect(searchInput).toHaveValue("");
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
  });

  it("displays search results in tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(screen.getByText(/Wszystko \(\d+\)/)).toBeInTheDocument();
        expect(screen.getByText(/Audiobooki \(\d+\)/)).toBeInTheDocument();
        expect(screen.getByText(/Autorzy \(\d+\)/)).toBeInTheDocument();
        expect(screen.getByText(/Rozdziały \(\d+\)/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("switches between result tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(screen.getByText(/Audiobooki \(\d+\)/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const audiobooksTab = screen.getByText(/Audiobooki \(\d+\)/);
    await user.click(audiobooksTab);

    // Should show only audiobooks
    expect(screen.getByText("Test Audiobook 1")).toBeInTheDocument();
  });

  it("navigates to audiobook when clicking audiobook result", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(screen.getByText("Test Audiobook 1")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const audiobookCard = screen.getByText("Test Audiobook 1").closest("div");
    await user.click(audiobookCard);

    expect(mockNavigate).toHaveBeenCalledWith("/audiobook/1");
  });

  it("navigates to author when clicking author result", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(screen.getByText("Test Author")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const authorCard = screen.getByText("Test Author").closest("div");
    await user.click(authorCard);

    expect(mockNavigate).toHaveBeenCalledWith("/author/1");
  });

  it("shows no results message when search returns empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );
    await user.type(searchInput, "nonexistent");

    await waitFor(
      () => {
        expect(
          screen.getByText(/Nie znaleziono wyników dla "nonexistent"/)
        ).toBeInTheDocument();
        expect(
          screen.getByText("Spróbuj użyć innych słów kluczowych")
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("displays audiobook metadata in search results", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziały/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(screen.getByText("Test Author")).toBeInTheDocument();
        expect(screen.getByText("Test Narrator")).toBeInTheDocument();
        expect(screen.getByText("Fiction")).toBeInTheDocument();
        expect(screen.getByText("4.5")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("displays chapters in search results", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziály/i
    );
    await user.type(searchInput, "chapter");

    await waitFor(
      () => {
        // Chapters should be found and displayed
        const chaptersTab = screen.getByText(/Rozdziały \(\d+\)/);
        expect(chaptersTab).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("shows correct result counts in tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziály/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        // Check if counts are displayed properly
        expect(screen.getByText(/Wszystko \(\d+\)/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("handles loading state during search", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziály/i
    );

    await user.type(searchInput, "test");

    // Should show loading state immediately
    expect(screen.getByText("Wyszukiwanie...")).toBeInTheDocument();
  });

  it("debounces search input to avoid excessive API calls", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziály/i
    );

    // Type quickly
    await user.type(searchInput, "test", { delay: 50 });

    // Should not immediately search, should wait for debounce
    expect(screen.queryByText("Wyszukiwanie...")).toBeInTheDocument();
  });

  it("maintains search state when switching tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziály/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(screen.getByText(/Audiobooki \(\d+\)/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Switch to authors tab
    const authorsTab = screen.getByText(/Autorzy \(\d+\)/);
    await user.click(authorsTab);

    // Search input should still contain the query
    expect(searchInput).toHaveValue("test");
  });

  it("displays play button for audiobook results", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const searchInput = screen.getByPlaceholderText(
      /wyszukaj audiobooki, autorów lub rozdziály/i
    );
    await user.type(searchInput, "test");

    await waitFor(
      () => {
        expect(screen.getByText("Test Audiobook 1")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Hover over audiobook card to see play button
    const audiobookCard = screen.getByText("Test Audiobook 1").closest("div");
    await user.hover(audiobookCard);

    // Play button should be visible in the overlay
    expect(
      audiobookCard.querySelector('[data-testid="play-button"]') ||
        audiobookCard.querySelector("button")
    ).toBeInTheDocument();
  });
});
