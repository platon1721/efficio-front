import api, { tokenStorage } from './client';
import type {
    JwtResponse,
    LoginRequest,
    RegisterRequest,
    UserInfo,
} from '../types/api';

export const authApi = {
    register: async (data: RegisterRequest): Promise<JwtResponse> => {
        const response = await api.post<JwtResponse>('/Auth/Register', data);
        tokenStorage.setTokens(response.data.token, response.data.refreshToken);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<JwtResponse> => {
        const response = await api.post<JwtResponse>('/Auth/Login', data);
        tokenStorage.setTokens(response.data.token, response.data.refreshToken);
        return response.data;
    },

    logout: async (): Promise<void> => {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
            try {
                await api.post('/Auth/Logout', { refreshToken });
            } catch {
                // Ignore logout errors
            }
        }
        tokenStorage.clear();
    },

    getUserInfo: async (): Promise<UserInfo> => {
        const response = await api.get<UserInfo>('/Auth/UserInfo');
        return response.data;
    },
};