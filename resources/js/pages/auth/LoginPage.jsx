import React, { useState } from 'react';

import { getValidationErrors } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
    const { login } = useAuth();
    const [form, setForm] = useState({ staff_id: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitLogin = async (event) => {
        event.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const user = await login(form);

            if (Number(user?.role) === 1) {
                window.location.href = '/admin/dashboard';
            } else if (Number(user?.role) === 2) {
                window.location.href = '/staff/dashboard';
            }
        } catch (error) {
            setErrors(getValidationErrors(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const generalError = errors['error-message']?.[0];

    return (
        <div className="login">
            {generalError && <div className="error-message">{generalError}</div>}

            <div className="container">
                <div className="title">Staff Login</div>

                <form action="/login" method="POST" onSubmit={submitLogin}>
                    <div className="login-field">
                        <span className="details">Staff ID</span>
                        <input
                            type="text"
                            name="staff_id"
                            placeholder="Enter your staff id"
                            value={form.staff_id}
                            required
                            onChange={(event) => setForm((current) => ({ ...current, staff_id: event.target.value }))}
                        />
                        {errors.staff_id?.map((message) => <div className="error-message" key={message}>{message}</div>)}
                    </div>

                    <div className="login-field">
                        <span className="details">Password</span>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                            value={form.password}
                            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        />
                        {errors.password?.map((message) => <div className="error-message" key={message}>{message}</div>)}
                    </div>

                    <div className="remember">
                        <label>
                            <input type="checkbox" />Remember me
                        </label>
                    </div>

                    <div className="login-button">
                        <input type="submit" value="Sign in" disabled={isSubmitting} />
                    </div>

                    <div className="flex">
                        <div className="register"><a href="/register">Register Account</a></div>
                        <div className="divider">|</div>
                        <div className="forgot-link"><a href="/forgot-password">Forgot Password</a></div>
                    </div>
                </form>
            </div>
        </div>
    );
}
