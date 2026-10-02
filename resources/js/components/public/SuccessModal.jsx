import React from 'react';

export default function SuccessModal({ message = '', onClose = () => {} }) {
    return (
        <div className={`modal-success-message${message ? ' visible' : ''}`}>
            <div className="wrapper">
                <div className="content">
                    <i className="bx bxs-check-circle"></i>
                    <h1>Success</h1>
                    <span className="message">{message || 'Your order has been submitted successfully!'}</span>
                    <button type="button" className="close-modal" onClick={onClose}><span>OK</span></button>
                </div>
            </div>
        </div>
    );
}
