import axios from 'axios';

const csrfCookiePath = import.meta.env.VITE_CSRF_COOKIE_PATH || '/sanctum/csrf-cookie';

const createClient = (baseURL) => {
    const client = axios.create({
        baseURL,
        withCredentials: true,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN',
    });

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            const response = error.response;
            const payload = response?.data || {};

            error.status = response?.status;
            error.validationErrors = payload.errors || {};
            error.userMessage = payload.message || payload['error-message'] || null;

            if (response?.status === 401) {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            }

            if (response?.status === 403) {
                window.dispatchEvent(new CustomEvent('auth:forbidden'));
            }

            if (response?.status === 422) {
                window.dispatchEvent(new CustomEvent('api:validation-error', {
                    detail: error.validationErrors,
                }));
            }

            if (response?.status >= 500) {
                window.dispatchEvent(new CustomEvent('api:server-error'));
            }

            return Promise.reject(error);
        },
    );

    return client;
};

// REST API client. The /api prefix can be replaced through VITE_API_BASE_URL
// when the frontend is deployed separately from Laravel.
export const apiClient = createClient(import.meta.env.VITE_API_BASE_URL || '/api');

// Temporary compatibility client for the existing JSON order endpoint. It will
// be switched to the REST endpoint when the order API is migrated.
export const webClient = createClient(import.meta.env.VITE_WEB_BASE_URL || '');

export const ensureCsrfCookie = () => webClient.get(csrfCookiePath);

export const getValidationErrors = (error) => error?.validationErrors || {};

export default apiClient;
