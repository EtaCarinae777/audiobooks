import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import AxiosInstance from "../AxiosInstance";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

describe("AxiosInstance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("creates axios instance with correct configuration", () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://127.0.0.1:8000/",
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });
  });

  it("sets up request interceptor", () => {
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };

    axios.create.mockReturnValue(mockAxiosInstance);

    // Re-import to trigger the interceptor setup
    delete require.cache[require.resolve("../AxiosInstance")];
    require("../AxiosInstance");

    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it("sets up response interceptor", () => {
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };

    axios.create.mockReturnValue(mockAxiosInstance);

    // Re-import to trigger the interceptor setup
    delete require.cache[require.resolve("../AxiosInstance")];
    require("../AxiosInstance");

    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  describe("Request Interceptor", () => {
    let requestInterceptor;

    beforeEach(() => {
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn((interceptor) => {
              requestInterceptor = interceptor;
            }),
          },
          response: {
            use: vi.fn(),
          },
        },
      };

      axios.create.mockReturnValue(mockAxiosInstance);

      // Re-import to trigger the interceptor setup
      delete require.cache[require.resolve("../AxiosInstance")];
      require("../AxiosInstance");
    });

    it("adds token to request headers when token exists", () => {
      mockLocalStorage.getItem.mockReturnValue("test-token");

      const config = {
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("Token");
      expect(result.headers.Authorization).toBe("Token test-token");
    });

    it("sets empty authorization when no token exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const config = {
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("Token");
      expect(result.headers.Authorization).toBe("");
    });

    it("preserves existing config properties", () => {
      mockLocalStorage.getItem.mockReturnValue("test-token");

      const config = {
        headers: {
          "Custom-Header": "custom-value",
        },
        method: "POST",
        url: "/test",
      };

      const result = requestInterceptor(config);

      expect(result.headers["Custom-Header"]).toBe("custom-value");
      expect(result.method).toBe("POST");
      expect(result.url).toBe("/test");
      expect(result.headers.Authorization).toBe("Token test-token");
    });
  });

  describe("Response Interceptor", () => {
    let responseSuccessHandler;
    let responseErrorHandler;

    beforeEach(() => {
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn((success, error) => {
              responseSuccessHandler = success;
              responseErrorHandler = error;
            }),
          },
        },
      };

      axios.create.mockReturnValue(mockAxiosInstance);

      // Re-import to trigger the interceptor setup
      delete require.cache[require.resolve("../AxiosInstance")];
      require("../AxiosInstance");
    });

    it("returns response unchanged on success", () => {
      const mockResponse = {
        data: { message: "success" },
        status: 200,
        headers: {},
      };

      const result = responseSuccessHandler(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it("removes token on 401 error", () => {
      const mockError = {
        response: {
          status: 401,
          data: { error: "Unauthorized" },
        },
      };

      responseErrorHandler(mockError);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("Token");
    });

    it("does not remove token on non-401 errors", () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: "Bad Request" },
        },
      };

      responseErrorHandler(mockError);

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it("handles errors without response object", () => {
      const mockError = {
        message: "Network Error",
      };

      // Should not throw
      expect(() => {
        responseErrorHandler(mockError);
      }).not.toThrow();

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it("handles 401 error without response data", () => {
      const mockError = {
        response: {
          status: 401,
        },
      };

      responseErrorHandler(mockError);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("Token");
    });
  });

  describe("Instance Configuration", () => {
    it("has correct base URL", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "http://127.0.0.1:8000/",
        })
      );
    });

    it("has correct timeout", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        })
      );
    });

    it("has correct default headers", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        })
      );
    });
  });

  describe("Error Handling", () => {
    let responseErrorHandler;

    beforeEach(() => {
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn((success, error) => {
              responseErrorHandler = error;
            }),
          },
        },
      };

      axios.create.mockReturnValue(mockAxiosInstance);

      // Re-import
      delete require.cache[require.resolve("../AxiosInstance")];
      require("../AxiosInstance");
    });

    it("handles 403 errors correctly", () => {
      const mockError = {
        response: {
          status: 403,
          data: { error: "Forbidden" },
        },
      };

      responseErrorHandler(mockError);

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it("handles 500 errors correctly", () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: "Internal Server Error" },
        },
      };

      responseErrorHandler(mockError);

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it("handles request timeout errors", () => {
      const mockError = {
        code: "ECONNABORTED",
        message: "timeout of 5000ms exceeded",
      };

      expect(() => {
        responseErrorHandler(mockError);
      }).not.toThrow();
    });

    it("handles network errors", () => {
      const mockError = {
        message: "Network Error",
        code: "NETWORK_ERROR",
      };

      expect(() => {
        responseErrorHandler(mockError);
      }).not.toThrow();
    });
  });
});
