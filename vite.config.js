import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig(({ command }) => ({
    // Laravel's Vite integration is required for production builds. During
    // standalone Vite preview, the technical index.html is served directly.
    plugins: command === 'build'
        ? [laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        })]
        : [],
    // When the standalone Vite page is opened on :5173, forward API and
    // Sanctum requests to Laravel instead of letting Vite's SPA fallback
    // return index.html as a fake successful response.
    server: {
        proxy: {
            '/api': {
                target: process.env.VITE_LARAVEL_URL || 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/sanctum': {
                target: process.env.VITE_LARAVEL_URL || 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
}));
