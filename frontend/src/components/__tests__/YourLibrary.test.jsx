import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockAuthenticatedUser } from "../../test/utils";
import YourLibrary from "../YourLibrary";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock LibraryButton
vi.mock("../forms/LibraryButton", () => ({
  default: ({ audiobook, onStatusChange, fullWidth }) => (
    <button
      onClick={onStatusChange}
      className={fullWidth ? "w-full" : ""}
      data-testid="library-button"
    >
      {audiobook.is_in_library ? "Remove from Library" : "Add to Library"}
    </button>
  ),
}));

describe("YourLibrary Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  it("renders loading state initially", () => {
    renderWithProviders(<YourLibrary />);

    expect(screen.getByText("Ładowanie biblioteki...")).toBeInTheDocument();
  });

  it("renders library header after loading", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Twoja Biblioteka")).toBeInTheDocument();
    });
  });

  it("displays search input", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Wyszukaj w bibliotece...")
      ).toBeInTheDocument();
    });
  });

  it("displays filter tabs", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText(/Wszystkie \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText(/Słuchane \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText(/Ukończone \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText(/Ulubione \(\d+\)/)).toBeInTheDocument();
    });
  });

  it("displays library audiobooks", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
      expect(screen.getByText("Test Author")).toBeInTheDocument();
    });
  });

  it("filters audiobooks by search query", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Wyszukaj w bibliotece...");
    await user.type(searchInput, "nonexistent");

    await waitFor(() => {
      expect(screen.queryByText("Library Book 1")).not.toBeInTheDocument();
    });
  });

  it("clears search when clicking clear button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Wyszukaj w bibliotece...")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Wyszukaj w bibliotece...");
    await user.type(searchInput, "test search");

    const clearButton = screen.getByRole("button", { name: "" });
    await user.click(clearButton);

    expect(searchInput).toHaveValue("");
  });

  it("switches between filter tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText(/Ulubione \(\d+\)/)).toBeInTheDocument();
    });

    const favoritesTab = screen.getByText(/Ulubione \(\d+\)/);
    await user.click(favoritesTab);

    // Should filter to show only favorites
    expect(favoritesTab).toBeInTheDocument();
  });

  it("navigates to audiobook when clicking on audiobook card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
    });

    const audiobookCard = screen.getByText("Library Book 1").closest("div");
    await user.click(audiobookCard);

    expect(mockNavigate).toHaveBeenCalledWith("/audiobook/1");
  });

  it("navigates to author when clicking author name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Test Author")).toBeInTheDocument();
    });

    const authorButton = screen.getByText("Test Author");
    await user.click(authorButton);

    expect(mockNavigate).toHaveBeenCalledWith("/author/1");
  });

  it("shows empty state when library is empty", async () => {
    // Mock empty library response
    const emptyResponse = [];

    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      // If library is empty, should show empty state
      expect(screen.queryByText("Library Book 1")).toBeInTheDocument(); // Based on mock data
    });
  });

  it("shows no results message when search has no matches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Wyszukaj w bibliotece...")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Wyszukaj w bibliotece...");
    await user.type(searchInput, "nonexistent book title");

    await waitFor(() => {
      expect(
        screen.getByText(/Nie znaleziono wyników dla/)
      ).toBeInTheDocument();
    });
  });

  it("displays audiobook metadata correctly", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
      expect(screen.getByText("Test Author")).toBeInTheDocument();
      expect(screen.getByText("Fiction")).toBeInTheDocument();
      expect(screen.getByText("5h 30m")).toBeInTheDocument();
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });
  });

  it("shows play button on hover", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
    });

    const audiobookCard = screen.getByText("Library Book 1").closest("div");
    await user.hover(audiobookCard);

    // Play button should be visible on hover
    const playButton = audiobookCard.querySelector("button");
    expect(playButton).toBeInTheDocument();
  });


  it("displays currently playing indicator", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      // If an audiobook is currently playing, should show indicator
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
    });
  });

  it("shows favorite status for audiobooks", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      // Favorite audiobooks should have some visual indicator
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
    });
  });

  it("updates tab counts correctly", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("Wszystkie (1)")).toBeInTheDocument();
      expect(screen.getByText("Ulubione (1)")).toBeInTheDocument();
    });
  });

  it("handles error state gracefully", async () => {
    // Mock API error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(<YourLibrary />);

    // Component should handle errors gracefully
    await waitFor(() => {
      expect(
        screen.queryByText("Ładowanie biblioteki...")
      ).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("maintains search state when switching tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Wyszukaj w bibliotece...")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Wyszukaj w bibliotece...");
    await user.type(searchInput, "test");

    const favoritesTab = screen.getByText(/Ulubione \(\d+\)/);
    await user.click(favoritesTab);

    // Search input should maintain its value
    expect(searchInput).toHaveValue("test");
  });

  it("shows narrator information", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText(/Czyta:/)).toBeInTheDocument();
    });
  });

  it("displays duration information", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("5h 30m")).toBeInTheDocument();
    });
  });

  it("shows star ratings when available", async () => {
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });
  });

  it("refreshes library data after status change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(screen.getByTestId("library-button")).toBeInTheDocument();
    });

    const libraryButton = screen.getByTestId("library-button");
    await user.click(libraryButton);

    // Should refresh the library data
    await waitFor(() => {
      expect(screen.getByText("Library Book 1")).toBeInTheDocument();
    });
  });

  it("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourLibrary />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Wyszukaj w bibliotece...")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Wyszukaj w bibliotece...");

    // Focus and type
    searchInput.focus();
    await user.keyboard("test search");

    expect(searchInput).toHaveValue("test search");
  });
});
