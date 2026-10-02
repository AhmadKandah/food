import apiClient, { ensureCsrfCookie } from '../api/client';

export const authService = {
    async currentUser() {
        const response = await apiClient.get('/user');
        return response.data && typeof response.data === 'object' && !Array.isArray(response.data)
            ? response.data
            : null;
    },

    async login(credentials) {
        await ensureCsrfCookie();
        const response = await apiClient.post('/login', credentials);
        return response.data;
    },

    async logout() {
        await ensureCsrfCookie();
        const response = await apiClient.post('/logout');
        return response.data;
    },

    async register(payload) {
        await ensureCsrfCookie();
        const response = await apiClient.post('/register', payload);
        return response.data;
    },

    async forgotPassword(payload) {
        await ensureCsrfCookie();
        const response = await apiClient.post('/forgot-password', payload);
        return response.data;
    },
};
