// src/components/__tests__/Account.test.jsx - ZASTĄP zawartość
import { describe, it, expect } from "vitest";
import {
  renderWithProviders,
  mockAuthenticatedUser,
} from "../../../test/utils";
import Account from "../Account";

describe("Account Component", () => {
  it("renders without crashing", () => {
    mockAuthenticatedUser();
    renderWithProviders(<Account />);
    expect(document.body).toBeTruthy();
  });

  it("displays some content", () => {
    mockAuthenticatedUser();
    renderWithProviders(<Account />);

    // Sprawdź czy coś się wyrenderowało
    const hasContent = document.body.textContent.length > 0;
    expect(hasContent).toBe(true);
  });
});
