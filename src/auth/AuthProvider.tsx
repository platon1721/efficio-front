import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/client';
import type { UserInfo } from '../types/api';

interface AuthContextType {
    user: UserInfo | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = tokenStorage.getToken();
        if (token) {
            authApi
                .getUserInfo()
                .then(setUser)
                .catch(() => tokenStorage.clear())
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        await authApi.login({ email, password });
        const userInfo = await authApi.getUserInfo();
        setUser(userInfo);
    };

    const register = async (email: string, password: string) => {
        await authApi.register({ email, password });
        const userInfo = await authApi.getUserInfo();
        setUser(userInfo);
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}