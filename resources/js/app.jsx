import React from 'react';
import { createRoot } from 'react-dom/client';

import './bootstrap';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

const rootElement = document.getElementById('root');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </AuthProvider>
        </React.StrictMode>,
    );
}
