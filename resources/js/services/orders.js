import { apiClient, ensureCsrfCookie } from '../api/client';

export const orderService = {
    async createOrder(payload) {
        await ensureCsrfCookie();
        const response = await apiClient.post('/orders', payload);
        return response.data;
    },
};
