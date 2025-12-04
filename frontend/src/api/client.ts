/**
 * Centralized API client
 * Handles all API requests with authentication, error handling, and retries
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  retries?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get Telegram initData for authentication
   */
  private getInitData(): string | null {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      if (import.meta.env.DEV) {
        console.warn('Telegram WebApp not available');
      }
      return null;
    }

    const initData = window.Telegram.WebApp.initData;
    if (!initData) {
      if (import.meta.env.DEV) {
        console.warn('Telegram initData not available');
      }
      return null;
    }

    return initData;
  }

  /**
   * Build headers for request
   */
  private buildHeaders(options: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add Telegram authentication if required
    if (options.requireAuth !== false) {
      const initData = this.getInitData();
      if (initData) {
        headers['Authorization'] = `Bearer ${initData}`;
      } else if (options.requireAuth === true) {
        // If auth is explicitly required but not available, log warning
        if (import.meta.env.DEV) {
          console.warn('Authentication required but Telegram initData not available');
        }
      }
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      // Handle error response
      let error: ApiResponse<T>['error'] = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        code: 'HTTP_ERROR',
      };

      if (isJson) {
        try {
          const data = await response.json();
          error = data.error || error;
        } catch {
          // Ignore JSON parse errors
        }
      }

      // Handle specific status codes
      if (response.status === 401) {
        error = {
          ...error,
          code: 'UNAUTHORIZED',
          message: 'Требуется авторизация',
        };
      } else if (response.status === 403) {
        error = {
          ...error,
          code: 'FORBIDDEN',
          message: 'Доступ запрещен',
        };
      } else if (response.status === 404) {
        error = {
          ...error,
          code: 'NOT_FOUND',
          message: 'Ресурс не найден',
        };
      } else if (response.status === 429) {
        error = {
          ...error,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Слишком много запросов, попробуйте позже',
        };
      }

      return {
        success: false,
        error,
      };
    }

    // Handle success response
    if (isJson) {
      const data = await response.json();
      return data;
    }

    return {
      success: true,
      data: (await response.text()) as T,
    };
  }

  /**
   * Make API request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const retries = options.retries ?? 0;
    const maxRetries = 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: this.buildHeaders(options),
        });

        const result = await this.handleResponse<T>(response);

        // Retry on network errors or 5xx errors
        if (!result.success && attempt < maxRetries && retries > 0) {
          const shouldRetry = response.status >= 500 || result.error?.code === 'NETWORK_ERROR';

          if (shouldRetry) {
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
        }

        return result;
      } catch (error) {
        // Network error
        if (attempt < maxRetries && retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Network error',
            code: 'NETWORK_ERROR',
          },
        };
      }
    }

    return {
      success: false,
      error: {
        message: 'Request failed after retries',
        code: 'RETRY_EXHAUSTED',
      },
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('photo', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};

    // Add Telegram authentication if required
    if (options?.requireAuth !== false) {
      const initData = this.getInitData();
      if (initData) {
        headers['Authorization'] = `Bearer ${initData}`;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Upload failed',
          code: 'UPLOAD_ERROR',
        },
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => apiClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient.put<T>(endpoint, data, options),
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiClient.patch<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: RequestOptions) => apiClient.delete<T>(endpoint, options),
  upload: <T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    options?: RequestOptions
  ) => apiClient.upload<T>(endpoint, file, additionalData, options),
};
