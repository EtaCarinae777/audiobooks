import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import {
  renderWithProviders,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "../../test/utils";
import ProtectedRoutes from "../ProtectedRoutes";

// Mock Navigate component
const MockNavigate = vi.fn(() => (
  <div data-testid="navigate-to-login">Redirecting to login...</div>
));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: MockNavigate,
    Outlet: () => <div data-testid="protected-content">Protected Content</div>,
  };
});

describe("ProtectedRoutes Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders protected content when user is authenticated", () => {
    mockAuthenticatedUser();

    renderWithProviders(<ProtectedRoutes />);

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate-to-login")).not.toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", () => {
    mockUnauthenticatedUser();

    renderWithProviders(<ProtectedRoutes />);

    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(MockNavigate).toHaveBeenCalledWith({ to: "/login" }, {});
  });

  it("checks localStorage for token", () => {
    const mockStorage = mockAuthenticatedUser();

    renderWithProviders(<ProtectedRoutes />);

    expect(mockStorage.getItem).toHaveBeenCalledWith("Token");
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("handles missing token correctly", () => {
    const mockStorage = mockUnauthenticatedUser();

    renderWithProviders(<ProtectedRoutes />);

    expect(mockStorage.getItem).toHaveBeenCalledWith("Token");
    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();
  });

  it("handles null token correctly", () => {
    const mockStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    renderWithProviders(<ProtectedRoutes />);

    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();
  });

  it("handles empty string token correctly", () => {
    const mockStorage = {
      getItem: vi.fn(() => ""),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    renderWithProviders(<ProtectedRoutes />);

    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();
  });

  it("handles whitespace-only token correctly", () => {
    const mockStorage = {
      getItem: vi.fn(() => "   "),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    renderWithProviders(<ProtectedRoutes />);

    // Whitespace token should be considered invalid
    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();
  });

  it("handles valid token correctly", () => {
    const mockStorage = {
      getItem: vi.fn(() => "valid-auth-token-123"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    renderWithProviders(<ProtectedRoutes />);

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("handles localStorage access errors gracefully", () => {
    // Mock localStorage.getItem to throw an error
    const mockStorage = {
      getItem: vi.fn(() => {
        throw new Error("localStorage not available");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    expect(() => {
      renderWithProviders(<ProtectedRoutes />);
    }).not.toThrow();

    // Should redirect to login when localStorage fails
    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();
  });

  it("re-evaluates authentication state on token change", () => {
    const mockStorage = mockUnauthenticatedUser();

    const { rerender } = renderWithProviders(<ProtectedRoutes />);

    // Initially not authenticated
    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();

    // Change to authenticated
    mockStorage.getItem.mockReturnValue("new-auth-token");

    rerender(<ProtectedRoutes />);

    // Should now show protected content
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("navigates to correct login path", () => {
    mockUnauthenticatedUser();

    renderWithProviders(<ProtectedRoutes />);

    expect(MockNavigate).toHaveBeenCalledWith({ to: "/login" }, {});
  });

  it("does not render Navigate component when authenticated", () => {
    mockAuthenticatedUser();

    renderWithProviders(<ProtectedRoutes />);

    expect(MockNavigate).not.toHaveBeenCalled();
  });

  it("renders Outlet component when authenticated", () => {
    mockAuthenticatedUser();

    renderWithProviders(<ProtectedRoutes />);

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("handles rapid token changes correctly", () => {
    const mockStorage = mockUnauthenticatedUser();

    const { rerender } = renderWithProviders(<ProtectedRoutes />);

    // Rapidly change token states
    mockStorage.getItem.mockReturnValue("token1");
    rerender(<ProtectedRoutes />);
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();

    mockStorage.getItem.mockReturnValue(null);
    rerender(<ProtectedRoutes />);
    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();

    mockStorage.getItem.mockReturnValue("token2");
    rerender(<ProtectedRoutes />);
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("maintains consistent behavior across renders", () => {
    mockAuthenticatedUser();

    const { rerender } = renderWithProviders(<ProtectedRoutes />);

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();

    // Re-render should maintain the same state
    rerender(<ProtectedRoutes />);

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate-to-login")).not.toBeInTheDocument();
  });

  it("handles browser environment without localStorage", () => {
    // Simulate environment without localStorage
    const originalLocalStorage = window.localStorage;
    delete window.localStorage;

    expect(() => {
      renderWithProviders(<ProtectedRoutes />);
    }).not.toThrow();

    // Should redirect to login when localStorage is not available
    expect(screen.getByTestId("navigate-to-login")).toBeInTheDocument();

    // Restore localStorage
    window.localStorage = originalLocalStorage;
  });

  it("validates token format (basic check)", () => {
    // Test with various token formats
    const testTokens = [
      "Bearer xyz123",
      "Token abc456",
      "jwt.token.here",
      "simple-token",
      "123456789",
      "very-long-token-string-that-might-be-valid",
    ];

    testTokens.forEach((token) => {
      const mockStorage = {
        getItem: vi.fn(() => token),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
      });

      const { unmount } = renderWithProviders(<ProtectedRoutes />);

      // Any non-empty token should be considered valid for basic check
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();

      unmount();
    });
  });
});
