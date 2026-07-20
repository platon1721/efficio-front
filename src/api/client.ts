import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';import type { ApiError, JwtResponse, RefreshTokenRequest } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5007/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ==================== Token Storage ====================

const TOKEN_KEY = 'efficio_token';
const REFRESH_TOKEN_KEY = 'efficio_refresh_token';

export const tokenStorage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

    setTokens: (token: string, refreshToken: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};

// ==================== Request Interceptor ====================

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==================== Response Interceptor (Token Refresh) ====================

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (token) resolve(token);
        else reject(error);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only attempt refresh on 401, not on auth endpoints
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/Auth/')
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const token = tokenStorage.getToken();
                const refreshToken = tokenStorage.getRefreshToken();

                if (!token || !refreshToken) {
                    throw new Error('No tokens available');
                }

                const { data } = await axios.post<JwtResponse>(
                    `${API_BASE_URL}/Auth/RefreshToken`,
                    { token, refreshToken } satisfies RefreshTokenRequest
                );

                tokenStorage.setTokens(data.token, data.refreshToken);
                processQueue(null, data.token);

                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                tokenStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ==================== Error Helper ====================

export function getApiError(error: unknown): ApiError {
    if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data as ApiError;
    }
    return {
        type: 'unknown',
        title: 'Unexpected error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Something went wrong',
    };
}

export default api;