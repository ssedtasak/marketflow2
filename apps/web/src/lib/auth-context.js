import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);
const TOKEN_KEY = 'mf_token';
const USER_KEY = 'mf_user';
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Only use dev bypass in development environment
        if (import.meta.env.VITE_ENVIRONMENT === 'production') {
            // Production: require real auth via login()
            const storedToken = localStorage.getItem(TOKEN_KEY);
            const storedUser = localStorage.getItem(USER_KEY);
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
            return;
        }
        // Dev mode bypass: auto-login as dev user
        const devToken = 'dev-token';
        const devUser = { id: 'dev-user-1', email: 'dev@example.com' };
        setToken(devToken);
        setUser(devUser);
        setIsLoading(false);
    }, []);
    const login = (newToken, newUser) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, token, isLoading, login, logout }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
