import { API_ROUTES } from "@/constants/api-routes";
import { ENV } from "@/constants/common";
import { getCurrentLanguage, i18n } from "@/i18n";
import { useUserInfoStore } from "@/stores/user-info";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import camelcaseKeys from "camelcase-keys";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

class APIHelper {
  private axiosClient: AxiosInstance;

  constructor(readonly baseURL?: string) {
    this.axiosClient = axios.create({
      baseURL,
      headers: {
        accept: "application/json",
      },
    });

    this.checkToken();
    this.checkExpiredToken();
    this.transformResponse();
  }

  public checkToken(): void {
    this.axiosClient.interceptors.request.use(
      (config) => {
        const { tokens } = useUserInfoStore.getState() || {};
        const { accessToken } = tokens || {};
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
          config.headers["Authorization"] = undefined;
        }
        config.headers["Accept-Language"] = getCurrentLanguage();
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  private transformResponse(): void {
    this.axiosClient.interceptors.response.use((response) => {
      if (response.data && typeof response.data === "object") {
        response.data = camelcaseKeys(response.data, { deep: true });
      }
      return response;
    });
  }

  private checkExpiredToken(): void {
    this.axiosClient.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (!axios.isAxiosError(error) || !error.response) {
          throw error;
        }

        const { tokens, updateTokens } = useUserInfoStore.getState() || {};
        const originalRequest = error.config as RetriableRequestConfig;
        const isRefreshRequest = originalRequest?.url?.includes(
          API_ROUTES.REFRESH_TOKEN,
        );

        if (
          error.response.status === 401 &&
          tokens?.accessToken &&
          tokens.refreshToken &&
          !originalRequest?._retry &&
          !isRefreshRequest
        ) {
          originalRequest._retry = true;
          const { data } = await this.axiosClient.post<{
            accessToken: string;
            refreshToken: string;
          }>(API_ROUTES.REFRESH_TOKEN, {
            refreshToken: tokens.refreshToken,
          });

          updateTokens(data);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          return this.axiosClient.request(originalRequest);
        }

        if (isRefreshRequest) {
          // force logout
          useUserInfoStore.getState().logout();
        }

        throw error;
      },
    );
  }

  private errorHandler<T>(
    callback: () => Promise<AxiosResponse<T>>,
  ): Promise<T> {
    return callback()
      .then((res) => res.data)
      .catch((error: AxiosError) => {
        if (!error.response) {
          throw {
            errorCode: "NETWORK_ERROR",
            message: i18n.t("apiError.networkText"),
            messageKey: "apiError.networkText",
          };
        }

        const payload = error.response.data;
        if (payload && typeof payload === "object") {
          throw camelcaseKeys(payload, { deep: true });
        }

        throw {
          errorCode: "REQUEST_FAILED",
          message: String(payload || i18n.t("apiError.genericText")),
          messageKey: "apiError.genericText",
          statusCode: error.response.status,
        };
      });
  }

  private request<T>(
    method: string,
    url: string,
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    return this.errorHandler<T>(() =>
      this.axiosClient.request<T>({ method, url, ...options }),
    );
  }

  get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("GET", url, options);
  }

  post<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("POST", url, { ...options });
  }

  put<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("PUT", url, { ...options });
  }

  patch<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("PATCH", url, { ...options });
  }

  delete<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, options);
  }
}

export const APIs = new APIHelper(ENV.API_URL);
