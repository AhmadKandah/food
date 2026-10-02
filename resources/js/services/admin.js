import apiClient, { ensureCsrfCookie } from '../api/client';

const unwrap = (response) => response.data;
const formConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

const request = async (method, url, payload = null, config = {}) => {
    await ensureCsrfCookie();
    const response = await apiClient.request({ method, url, data: payload, ...config });
    return unwrap(response);
};

const query = (params = {}) => ({ params: Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')) });

export const adminService = {
    dashboard: () => apiClient.get('/admin/dashboard').then(unwrap),

    staff: (params) => apiClient.get('/admin/staff', query(params)).then(unwrap),
    staffById: (id) => apiClient.get(`/admin/staff/${id}`).then(unwrap),
    createStaff: (payload) => request('post', '/admin/staff', payload),
    updateStaff: (id, payload) => request('post', `/admin/staff/${id}`, payload),
    deleteStaff: (id) => request('delete', `/admin/staff/${id}`),
    staffIds: (params) => apiClient.get('/admin/staff-ids', query(params)).then(unwrap),
    createStaffId: (payload) => request('post', '/admin/staff-ids', payload),
    deleteStaffId: (id) => request('delete', `/admin/staff-ids/${encodeURIComponent(id)}`),

    foodMenus: (params) => apiClient.get('/admin/food-menus', query(params)).then(unwrap),
    foodMenuById: (id) => apiClient.get(`/admin/food-menus/${id}`).then(unwrap),
    createFoodMenu: (payload) => request('post', '/admin/food-menus', payload, formConfig),
    updateFoodMenu: (id, payload) => request('post', `/admin/food-menus/${id}`, payload, formConfig),
    deleteFoodMenu: (id) => request('delete', `/admin/food-menus/${id}`),
    foodCategories: (params) => apiClient.get('/admin/food-categories', query(params)).then(unwrap),
    createFoodCategory: (payload) => request('post', '/admin/food-categories', payload),
    deleteFoodCategory: (id) => request('delete', `/admin/food-categories/${id}`),

    restaurantItems: (params) => apiClient.get('/admin/restaurant-items', query(params)).then(unwrap),
    restaurantItemById: (id) => apiClient.get(`/admin/restaurant-items/${id}`).then(unwrap),
    createRestaurantItem: (payload) => request('post', '/admin/restaurant-items', payload),
    updateRestaurantItem: (id, payload) => request('post', `/admin/restaurant-items/${id}`, payload),
    deleteRestaurantItem: (id) => request('delete', `/admin/restaurant-items/${id}`),
    itemCategories: (params) => apiClient.get('/admin/item-categories', query(params)).then(unwrap),
    createItemCategory: (payload) => request('post', '/admin/item-categories', payload),
    deleteItemCategory: (id) => request('delete', `/admin/item-categories/${id}`),

    partnerships: (params) => apiClient.get('/admin/partnerships', query(params)).then(unwrap),
    partnershipById: (id) => apiClient.get(`/admin/partnerships/${id}`).then(unwrap),
    createPartnership: (payload) => request('post', '/admin/partnerships', payload, formConfig),
    updatePartnership: (id, payload) => request('post', `/admin/partnerships/${id}`, payload, formConfig),
    deletePartnership: (id) => request('delete', `/admin/partnerships/${id}`),

    promotionDiscounts: (params) => apiClient.get('/admin/promotion-discounts', query(params)).then(unwrap),
    promotionDiscountById: (id) => apiClient.get(`/admin/promotion-discounts/${id}`).then(unwrap),
    createPromotionDiscount: (payload) => request('post', '/admin/promotion-discounts', payload),
    updatePromotionDiscount: (id, payload) => request('post', `/admin/promotion-discounts/${id}`, payload),
    deletePromotionDiscount: (id) => request('delete', `/admin/promotion-discounts/${id}`),
    promotionEvents: (params) => apiClient.get('/admin/promotion-events', query(params)).then(unwrap),
    createPromotionEvent: (payload) => request('post', '/admin/promotion-events', payload, formConfig),
    updatePromotionEvent: (id, payload) => request('post', `/admin/promotion-events/${id}`, payload, formConfig),
    deletePromotionEvent: (id) => request('delete', `/admin/promotion-events/${id}`),

    profile: () => apiClient.get('/admin/profile').then(unwrap),
    updateProfile: (payload) => request('post', '/admin/profile', payload),
    updatePassword: (payload) => request('post', '/admin/password', payload),
};

export const getAdminError = (error, fallback = 'Unable to complete the request.') => {
    if (error?.status === 401) return 'Your session has expired. Please sign in again.';
    if (error?.status === 403) return 'You do not have permission to access this page.';
    if (error?.status === 404) return 'The requested record was not found.';
    if (error?.status === 409) return error.userMessage || 'This record is in use and cannot be deleted.';
    if (error?.status >= 500) return 'The server could not complete the request.';
    return error?.userMessage || fallback;
};

export const getFieldError = (error, field) => error?.validationErrors?.[field]?.[0] || '';

