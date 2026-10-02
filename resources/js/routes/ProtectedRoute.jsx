import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ roles }) {
    const { isLoading, isAuthenticated, isAdmin, isStaff } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles?.length) {
        const roleAllowed = (roles.includes('admin') && isAdmin) || (roles.includes('staff') && isStaff);

        if (!roleAllowed) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
}
