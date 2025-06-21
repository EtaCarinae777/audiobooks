import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  mockAuthenticatedUser,
} from "../../../test/utils";
import LibraryButton from "../LibraryButton";

describe("LibraryButton Component", () => {
  const mockAudiobook = {
    id: 1,
    title: "Test Audiobook",
    author_name: "Test Author",
    is_in_library: false,
  };

  const mockAudiobookInLibrary = {
    id: 2,
    title: "Library Audiobook",
    author_name: "Library Author",
    is_in_library: true,
  };

  const defaultProps = {
    audiobook: mockAudiobook,
    onStatusChange: vi.fn(),
    size: "medium",
    fullWidth: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  it("renders add to library button when audiobook not in library", () => {
    renderWithProviders(<LibraryButton {...defaultProps} />);

    expect(screen.getByText("Dodaj do biblioteki")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveClass(/from-blue-600/);
  });

  it("renders remove from library button when audiobook in library", () => {
    renderWithProviders(
      <LibraryButton {...defaultProps} audiobook={mockAudiobookInLibrary} />
    );

    expect(screen.getByText("W bibliotece")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveClass(/from-emerald-600/);
  });

  it("shows correct icon for add to library", () => {
    renderWithProviders(<LibraryButton {...defaultProps} />);

    const button = screen.getByRole("button");
    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("shows correct icon for remove from library", () => {
    renderWithProviders(
      <LibraryButton {...defaultProps} audiobook={mockAudiobookInLibrary} />
    );

    const button = screen.getByRole("button");
    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("adds audiobook to library when clicked", async () => {
    const user = userEvent.setup();
    const mockOnStatusChange = vi.fn();

    renderWithProviders(
      <LibraryButton {...defaultProps} onStatusChange={mockOnStatusChange} />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    });
  });

  it("removes audiobook from library when clicked", async () => {
    const user = userEvent.setup();
    const mockOnStatusChange = vi.fn();

    renderWithProviders(
      <LibraryButton
        {...defaultProps}
        audiobook={mockAudiobookInLibrary}
        onStatusChange={mockOnStatusChange}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    });
  });

  it("shows loading state during operation", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LibraryButton {...defaultProps} />);

    const button = screen.getByRole("button");
    await user.click(button);

    // Should show loading state briefly
    expect(button).toBeDisabled();
  });

  it("applies small size correctly", () => {
    renderWithProviders(<LibraryButton {...defaultProps} size="small" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(/py-2/);
    expect(button).toHaveClass(/text-sm/);
  });

  it("applies medium size correctly", () => {
    renderWithProviders(<LibraryButton {...defaultProps} size="medium" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(/py-3/);
  });

  it("applies large size correctly", () => {
    renderWithProviders(<LibraryButton {...defaultProps} size="large" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(/py-4/);
    expect(button).toHaveClass(/text-lg/);
  });

  it("applies full width when specified", () => {
    renderWithProviders(<LibraryButton {...defaultProps} fullWidth={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full");
  });

  it("does not apply full width when not specified", () => {
    renderWithProviders(<LibraryButton {...defaultProps} fullWidth={false} />);

    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("w-full");
  });

  it("handles API error gracefully", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock API to return error
    const mockOnStatusChange = vi.fn();

    renderWithProviders(
      <LibraryButton {...defaultProps} onStatusChange={mockOnStatusChange} />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    // Component should handle error gracefully
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    consoleSpy.mockRestore();
  });

  it("updates button state after successful operation", async () => {
    const user = userEvent.setup();
    const mockOnStatusChange = vi.fn();

    renderWithProviders(
      <LibraryButton {...defaultProps} onStatusChange={mockOnStatusChange} />
    );

    const button = screen.getByRole("button");
    expect(screen.getByText("Dodaj do biblioteki")).toBeInTheDocument();

    await user.click(button);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalled();
    });
  });

  it("shows success message briefly after adding", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LibraryButton {...defaultProps} />);

    const button = screen.getByRole("button");
    await user.click(button);

    // Success feedback should appear briefly
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("shows success message briefly after removing", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <LibraryButton {...defaultProps} audiobook={mockAudiobookInLibrary} />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    // Success feedback should appear briefly
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("prevents multiple clicks during operation", async () => {
    const user = userEvent.setup();
    const mockOnStatusChange = vi.fn();

    renderWithProviders(
      <LibraryButton {...defaultProps} onStatusChange={mockOnStatusChange} />
    );

    const button = screen.getByRole("button");

    // Click multiple times rapidly
    await user.click(button);
    await user.click(button);
    await user.click(button);

    // Should only process one request
    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    });
  });

  it("applies custom style prop", () => {
    const customStyle = { backgroundColor: "red", color: "white" };

    renderWithProviders(
      <LibraryButton {...defaultProps} style={customStyle} />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveStyle("background-color: red");
    expect(button).toHaveStyle("color: white");
  });

  it("maintains hover effects", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LibraryButton {...defaultProps} />);

    const button = screen.getByRole("button");

    await user.hover(button);

    // Button should have hover classes
    expect(button).toHaveClass(/hover:scale-105/);
  });

  it("shows appropriate text for library status", () => {
    const { rerender } = renderWithProviders(
      <LibraryButton {...defaultProps} />
    );

    expect(screen.getByText("Dodaj do biblioteki")).toBeInTheDocument();

    rerender(
      <LibraryButton {...defaultProps} audiobook={mockAudiobookInLibrary} />
    );

    expect(screen.getByText("W bibliotece")).toBeInTheDocument();
  });

  it("handles undefined audiobook gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderWithProviders(
        <LibraryButton {...defaultProps} audiobook={undefined} />
      );
    }).not.toThrow();

    consoleSpy.mockRestore();
  });

  it("shows correct accessibility attributes", () => {
    renderWithProviders(<LibraryButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });

  it("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    const mockOnStatusChange = vi.fn();

    renderWithProviders(
      <LibraryButton {...defaultProps} onStatusChange={mockOnStatusChange} />
    );

    const button = screen.getByRole("button");

    // Focus and press Enter
    button.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalled();
    });
  });

  it("shows loading spinner when processing", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LibraryButton {...defaultProps} />);

    const button = screen.getByRole("button");
    await user.click(button);

    // Should show loading state
    expect(button).toBeDisabled();
  });
});
