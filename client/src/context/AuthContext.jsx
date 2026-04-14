// Manages authentication state globally
// Provides the JWT token, current user, and login/logout functions to the entire app

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_refresh_token");
        setToken(null);
    };

    // Attach the JWT to any fetch call that needs it
    const authFetch = (url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook so any component can just call useAuth()
export function useAuth() {
    return useContext(AuthContext);
}