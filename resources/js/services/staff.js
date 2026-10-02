import apiClient, { ensureCsrfCookie } from '../api/client';

const unwrap = (response) => response.data;
const formConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
const query = (params = {}) => ({ params: Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')) });

const write = async (method, url, payload = null, config = {}) => {
    await ensureCsrfCookie();
    const response = await apiClient.request({ method, url, data: payload, ...config });
    return unwrap(response);
};

export const staffService = {
    dashboard: () => apiClient.get('/staff/dashboard').then(unwrap),
    orders: (params) => apiClient.get('/staff/orders', query(params)).then(unwrap),
    order: (id) => apiClient.get(`/staff/orders/${id}`).then(unwrap),
    updateOrderStatus: (id, status) => write('patch', `/staff/orders/${id}/status`, { status }),
    diningTables: (params) => apiClient.get('/staff/dining-tables', query(params)).then(unwrap),
    createDiningTable: (payload) => write('post', '/staff/dining-tables', payload),
    reservations: (params) => apiClient.get('/staff/reservations', query(params)).then(unwrap),
    reservation: (id) => apiClient.get(`/staff/reservations/${id}`).then(unwrap),
    updateReservationStatus: (id, status) => write('patch', `/staff/reservations/${id}/status`, { status }),
    profile: () => apiClient.get('/staff/profile').then(unwrap),
    updateProfile: (payload) => write('post', '/staff/profile', payload, formConfig),
};

export const getStaffError = (error, fallback = 'Unable to complete the request.') => {
    if (!error) return '';
    if (error.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.status === 403) return 'You do not have permission to access this page.';
    if (error.status === 404) return 'The requested record was not found.';
    if (error.status === 409) return error.userMessage || 'This request conflicts with the current data.';
    if (error.status >= 500) return 'The server could not complete the request.';
    return error.userMessage || fallback;
};

export const getStaffFieldError = (error, field) => error?.validationErrors?.[field]?.[0] || '';

