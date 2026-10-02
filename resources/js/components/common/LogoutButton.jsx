import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LogoutButton({ id, showLabel = false }) {
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            window.location.href = '/login';
        }
    };

    return (
        <form action="/logout" method="POST" id={id ? `${id}-form` : undefined} onSubmit={(event) => event.preventDefault()}>
            <button type="button" id={id} onClick={handleLogout}>
                <i className="bx bx-log-out-circle"></i>
                {showLabel && <span>Logout</span>}
                {!showLabel && 'Logout'}
            </button>
        </form>
    );
}
