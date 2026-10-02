import { apiClient, ensureCsrfCookie } from '../api/client';

export const menuService = {
    async list(params = {}) {
        const response = await apiClient.get('/menu', { params });
        return response.data;
    },
};

export const promotionService = {
    async list() {
        const response = await apiClient.get('/promotions');
        return response.data;
    },
};

export const reservationService = {
    async create(payload) {
        await ensureCsrfCookie();
        const response = await apiClient.post('/reservations', payload);
        return response.data;
    },
};

export const tableMenuService = {
    async byEncryptedId(identifier) {
        const response = await apiClient.get(`/table-menu/order/table/${encodeURIComponent(identifier)}`);
        return response.data;
    },

    async byCode(code) {
        const response = await apiClient.get(`/table-menu/t/${encodeURIComponent(code)}`);
        return response.data;
    },

    async byTableNumber(tableNumber) {
        const response = await apiClient.get(`/table-menu/table/${encodeURIComponent(tableNumber)}`);
        return response.data;
    },
};
