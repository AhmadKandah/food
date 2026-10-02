import React, { useState } from 'react';

import { getValidationErrors } from '../../api/client';
import { authService } from '../../services/auth';

const initialForm = {
    name: '',
    staff_id: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    gender: '',
};

export default function RegisterPage() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined, 'error-message': undefined }));
    };

    const submitRegistration = async (event) => {
        event.preventDefault();
        setErrors({});
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const response = await authService.register(form);
            setSuccessMessage(response['success-message'] || response.message || 'Register Successful');
        } catch (error) {
            setErrors(getValidationErrors(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldErrors = (name) => (errors[name] || []).map((message) => (
        <div className="error-message" key={`${name}-${message}`}>{message}</div>
    ));

    return (
        <div className="registration">
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errors['error-message']?.map((message) => <div className="error-message" key={message}>{message}</div>)}

            <div className="container">
                <div className="title">Staff Registration</div>

                <form action="/register" method="POST" onSubmit={submitRegistration}>
                    <div className="registration-details">
                        <div className="registration-field">
                            <span className="details">Full Name</span>
                            <input type="text" name="name" placeholder="Enter your name" value={form.name} required onChange={(event) => updateField('name', event.target.value)} />
                            {fieldErrors('name')}
                        </div>

                        <div className="registration-field">
                            <span className="details">Staff ID</span>
                            <input type="text" name="staff_id" placeholder="Enter your staff id" value={form.staff_id} required onChange={(event) => updateField('staff_id', event.target.value)} />
                            {fieldErrors('staff_id')}
                        </div>

                        <div className="registration-field">
                            <span className="details">Email</span>
                            <input type="email" name="email" placeholder="Enter your email address" value={form.email} required onChange={(event) => updateField('email', event.target.value)} />
                            {fieldErrors('email')}
                        </div>

                        <div className="registration-field">
                            <span className="details">Phone Number</span>
                            <input type="text" name="phone" placeholder="Enter your phone number" value={form.phone} required onChange={(event) => updateField('phone', event.target.value)} />
                            {fieldErrors('phone')}
                        </div>

                        <div className="registration-field">
                            <span className="details">Password</span>
                            <input type="password" name="password" placeholder="Enter your password" value={form.password} required onChange={(event) => updateField('password', event.target.value)} />
                            {fieldErrors('password')}
                        </div>

                        <div className="registration-field">
                            <span className="details">Confirm Password</span>
                            <input type="password" name="password_confirmation" placeholder="Confirm your password" value={form.password_confirmation} required onChange={(event) => updateField('password_confirmation', event.target.value)} />
                            {fieldErrors('password')}
                        </div>

                        <div className="gender-details">
                            <input type="radio" name="gender" id="dot-1" value="Male" checked={form.gender === 'Male'} required onChange={(event) => updateField('gender', event.target.value)} />
                            <input type="radio" name="gender" id="dot-2" value="Female" checked={form.gender === 'Female'} required onChange={(event) => updateField('gender', event.target.value)} />
                            <span className="gender-title">Gender</span>
                            <div className="category">
                                <label htmlFor="dot-1"><span className="dot one"></span><span className="gender">Male</span></label>
                                <label htmlFor="dot-2"><span className="dot two"></span><span className="gender">Female</span></label>
                            </div>
                            {fieldErrors('gender')}
                        </div>
                    </div>

                    <div className="registration-button">
                        <input type="submit" value="Register" disabled={isSubmitting} />
                    </div>
                </form>
            </div>
        </div>
    );
}
