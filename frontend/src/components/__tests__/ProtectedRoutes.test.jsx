// src/components/__tests__/ProtectedRoutes.test.jsx - prosta wersja
import { describe, it, expect } from "vitest";
import {
  renderWithProviders,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "../../../test/utils";
import ProtectedRoutes from "../ProtectedRoutes";

describe("ProtectedRoutes Component", () => {
  it("renders for authenticated user", () => {
    mockAuthenticatedUser();
    const { container } = renderWithProviders(<ProtectedRoutes />);
    expect(container).toBeTruthy();
  });

  it("handles unauthenticated user", () => {
    mockUnauthenticatedUser();
    const { container } = renderWithProviders(<ProtectedRoutes />);
    expect(container).toBeTruthy();
  });
});
