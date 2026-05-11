import { API_ROUTES } from "@/constants/api-routes";
import { ENV } from "@/constants/common";
import { useUserInfoStore } from "@/stores/user-info";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import camelcaseKeys from "camelcase-keys";

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
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  private transformResponse(): void {
    this.axiosClient.interceptors.response.use((response) => {
      if (response.data) {
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
        const { tokens, updateTokens } = useUserInfoStore.getState() || {};

        if (error.response.status === 401 && tokens?.accessToken) {
          // call api refresh token
          const { data } = await this.post<{
            data: { accessToken: string; refreshToken: string };
          }>(API_ROUTES.REFRESH_TOKEN);
          updateTokens(data);
        }
        if (error.response.data.path.includes(API_ROUTES.REFRESH_TOKEN)) {
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
          throw new Error("Network error. Please try again later.");
        }

        throw error.response.data;
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
