import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import camelcaseKeys from "camelcase-keys";
import { API_ROUTES } from "@/shared/api/apiRoutes";
import { env } from "@/shared/env";
import {
  type AuthTokens,
  useUserStore,
} from "@/shared/stores/userStore";

class ApiClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: { accept: "application/json" },
    });

    this.attachAuthInterceptor();
    this.attachCamelCaseInterceptor();
    this.attachRefreshInterceptor();
  }

  private attachAuthInterceptor(): void {
    this.client.interceptors.request.use((config) => {
      const { tokens } = useUserStore.getState();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      return config;
    });
  }

  private attachCamelCaseInterceptor(): void {
    this.client.interceptors.response.use((response) => {
      if (response.data) {
        response.data = camelcaseKeys(response.data, { deep: true });
      }
      return response;
    });
  }

  private attachRefreshInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<{ path?: string }>) => {
        const status = error.response?.status;
        const { tokens, updateTokens, logout } = useUserStore.getState();

        if (status === 401 && tokens?.accessToken) {
          try {
            const body = await this.post<{ data: AuthTokens }>(
              API_ROUTES.REFRESH_TOKEN,
            );
            updateTokens(body.data);
          } catch {
            logout();
          }
        }

        if (error.response?.data?.path?.includes(API_ROUTES.REFRESH_TOKEN)) {
          logout();
        }

        throw error;
      },
    );
  }

  private async request<T>(
    method: string,
    url: string,
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    try {
      const response = await this.client.request<T>({ method, url, ...options });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (!axiosError.response) {
        throw new Error("Network error. Please try again later.");
      }
      throw axiosError.response.data;
    }
  }

  get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("GET", url, options);
  }

  post<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("POST", url, options);
  }

  put<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("PUT", url, options);
  }

  patch<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("PATCH", url, options);
  }

  delete<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, options);
  }
}

export const apiClient = new ApiClient(env.apiUrl);
