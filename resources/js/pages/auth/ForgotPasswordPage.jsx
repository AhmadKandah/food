import React, { useState } from 'react';

import { getValidationErrors } from '../../api/client';
import { authService } from '../../services/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitForgotPassword = async (event) => {
        event.preventDefault();
        setErrors({});
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const response = await authService.forgotPassword({ email });
            setSuccessMessage(response.message);
        } catch (error) {
            setErrors(getValidationErrors(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="forgot-password">
            <div className="container">
                <div className="title">Reset Password</div>

                <div className="text">
                    Enter your email address and and the password reset link will be sent to your email.
                    Please check your email to set a new password.
                </div>

                {successMessage && <div className="success-message">{successMessage}</div>}

                <form action="/forgot-password" method="POST" onSubmit={submitForgotPassword}>
                    <div className="forgot-field">
                        <span className="details">Email</span>
                        <input type="email" name="email" placeholder="Enter your email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                        {errors.email?.map((message) => <div className="validation-error-message" key={message}>{message}</div>)}
                    </div>

                    <div className="forgot-button">
                        <input type="submit" value="Send Reset Link" disabled={isSubmitting} />
                    </div>
                </form>
            </div>
        </div>
    );
}
