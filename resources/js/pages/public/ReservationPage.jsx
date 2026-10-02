import React, { useState } from 'react';

import SuccessModal from '../../components/public/SuccessModal';
import { getValidationErrors } from '../../api/client';
import { reservationService } from '../../services/public';

const initialForm = {
    book_name: '',
    book_email: '',
    book_phone: '',
    guest_number: '',
    book_date: '',
    book_time: '',
    book_message: '',
};

export default function ReservationPage() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
    };

    const submitReservation = async (event) => {
        event.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await reservationService.create(form);
            setSuccessMessage(response['success-message'] || response.message);
        } catch (error) {
            setErrors(getValidationErrors(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldErrors = (name) => (errors[name] || []).map((message) => (
        <div className="validation-error-message" key={message}>{message}</div>
    ));

    return (
        <div className="reservation-page">
            <section>
                <main>
                    <div className="page">
                        <div className="reservation-form">
                            <div className="header">
                                <h2>Make Your Reservation Now</h2>
                            </div>

                            <form action="/reservation/create" method="POST" onSubmit={submitReservation}>
                                <div className="top-detail">
                                    <span className="label">Your Name</span>
                                    <input type="text" name="book_name" placeholder="John Doe" value={form.book_name} required onChange={(event) => updateField('book_name', event.target.value)} />
                                    {fieldErrors('book_name')}

                                    <span className="label">Your E-mail</span>
                                    <input type="text" name="book_email" placeholder="john.doe@email.com" value={form.book_email} required onChange={(event) => updateField('book_email', event.target.value)} />
                                    {fieldErrors('book_email')}

                                    <span className="label">Your Phone</span>
                                    <input type="text" name="book_phone" placeholder="0123456789" value={form.book_phone} required onChange={(event) => updateField('book_phone', event.target.value)} />
                                    {fieldErrors('book_phone')}
                                </div>

                                <hr />

                                <div className="bottom-detail">
                                    <span className="label">Number of Guests</span>
                                    <input type="number" name="guest_number" placeholder="5" value={form.guest_number} required onChange={(event) => updateField('guest_number', event.target.value)} />
                                    {fieldErrors('guest_number')}

                                    <span className="label">Reservation Date</span>
                                    <input type="date" name="book_date" placeholder="20/03/2077" value={form.book_date} required onChange={(event) => updateField('book_date', event.target.value)} />
                                    {fieldErrors('book_date')}

                                    <span className="label">Reservation Time</span>
                                    <input type="time" name="book_time" placeholder="12.00 p.m." value={form.book_time} required onChange={(event) => updateField('book_time', event.target.value)} />
                                    {fieldErrors('book_time')}
                                </div>

                                <hr />

                                <div className="message">
                                    <span className="label">Message</span>
                                    <textarea name="book_message" placeholder="Tell us anything else that might be important." value={form.book_message} onChange={(event) => updateField('book_message', event.target.value)}></textarea>
                                    {fieldErrors('book_message')}
                                </div>

                                <div className="button-section">
                                    <input type="submit" value="Submit" disabled={isSubmitting} />
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </section>

            <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
    );
}
