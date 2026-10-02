import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '../services/auth';

const AuthContext = createContext(null);

const getRoleFlags = (user) => ({
    isAdmin: Number(user?.role) === 1,
    isStaff: Number(user?.role) === 2,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState('loading');

    const refresh = useCallback(async () => {
        setStatus('loading');

        try {
            const currentUser = await authService.currentUser();
            setUser(currentUser);
        } catch (error) {
            if (error.status !== 401) {
                // The current user endpoint is allowed to be unavailable while
                // the API migration is in progress. A 401 still means guest.
                console.error('Unable to load the current user.', error);
            }
            setUser(null);
        } finally {
            setStatus('ready');
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            setStatus('ready');
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const login = useCallback(async (credentials) => {
        const response = await authService.login(credentials);
        const authenticatedUser = response?.user || await authService.currentUser();

        setUser(authenticatedUser);
        setStatus('ready');

        return authenticatedUser;
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setStatus('ready');
    }, []);

    const value = useMemo(() => ({
        user,
        status,
        isLoading: status === 'loading',
        isAuthenticated: Boolean(user),
        ...getRoleFlags(user),
        refresh,
        login,
        logout,
    }), [login, logout, refresh, status, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider.');
    }

    return context;
}
