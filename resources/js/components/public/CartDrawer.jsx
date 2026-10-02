import React from 'react';
import { useEffect, useRef, useState } from 'react';

import { getValidationErrors } from '../../api/client';
import { useCart } from '../../hooks/useCart';
import { orderService } from '../../services/orders';
import { formatCurrency } from '../../utils/currency';

export default function CartDrawer({ open, onClose, onSuccess }) {
    const { items, totalItems, totalAmount, increase, decrease, remove, clear } = useCart();
    const [tableNumber, setTableNumber] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cartRef = useRef(null);

    useEffect(() => {
        document.body.classList.toggle('cart-active', open);

        return () => document.body.classList.remove('cart-active');
    }, [open]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleOutsideClick = (event) => {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('click', handleOutsideClick);

        return () => document.removeEventListener('click', handleOutsideClick);
    }, [onClose, open]);

    const clearError = () => setErrorMessage('');

    const submitOrder = async () => {
        clearError();

        if (!tableNumber.trim()) {
            setErrorMessage('Please enter table number.');
            return;
        }

        if (!customerContact.trim()) {
            setErrorMessage('Please enter your order number.');
            return;
        }

        if (!items.length) {
            setErrorMessage('Please add items to your cart first.');
            return;
        }

        setIsSubmitting(true);

        const cartData = items.map((item) => ({
            id: item.id,
            image: item.image,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            eachTotalPrice: (Number(item.price) * Number(item.quantity)).toFixed(2),
        }));

        try {
            const data = await orderService.createOrder({
                cartData,
                totalAmount: totalAmount.toFixed(2),
                table_number: tableNumber,
                customer_contact: customerContact,
            });

            if (data?.['success-message']) {
                clear();
                setTableNumber('');
                setCustomerContact('');
                setIsSubmitting(false);
                onSuccess(data['success-message']);
                return;
            }

            setErrorMessage(data?.['validation-error-message'] || 'An error occurred. Please try again.');
        } catch (error) {
            const responseMessage = error.response?.data?.['validation-error-message'];
            const validationErrors = getValidationErrors(error);
            const firstValidationError = Object.values(validationErrors)[0];
            setErrorMessage(responseMessage || firstValidationError?.[0] || error.userMessage || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cart-section" ref={cartRef} onClick={(event) => event.stopPropagation()}>
            <div className="header">
                <span>Confirm Order</span>
                <div className="close-cart" onClick={onClose}>
                    <i className="bx bx-x"></i>
                </div>
            </div>

            <div className="main-section-order">
                <span>Your Order</span>
                <div className="cart-total">
                    <span id="cart-item-count">Total {totalItems} items</span>
                    <span id="cart-total-amount">{formatCurrency(totalAmount)}</span>
                </div>
            </div>

            <div className="your-order">
                <ul className="cart-list">
                    {items.length === 0 ? (
                        <li><span className="empty">No item in cart</span></li>
                    ) : items.map((item) => (
                        <li key={item.id}>
                            <div className="product">
                                <img src={item.image} alt="food-image" />
                                <span>{item.name}</span>
                            </div>
                            <div className="quantity-price">
                                <span>{item.quantity}</span>
                                <span>{formatCurrency(Number(item.price) * Number(item.quantity))}</span>
                            </div>
                            <div className="action">
                                <button type="button" className="minus" data-food-id={item.id} onClick={() => decrease(item.id)}>-</button>
                                <span>{item.quantity}</span>
                                <button type="button" className="plus" data-food-id={item.id} onClick={() => increase(item.id)}>+</button>
                            </div>
                            <div className="delete">
                                <button type="button" className="cart-list-delete" onClick={() => remove(item.id)}>
                                    <i className="bx bxs-trash" data-food-id={item.id}></i>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="table-number">
                <div className="table-section">
                    <span>Table No.</span>
                    <input
                        type="text"
                        name="table_number"
                        placeholder="0"
                        required
                        value={tableNumber}
                        onChange={(event) => {
                            setTableNumber(event.target.value);
                            clearError();
                        }}
                    />
                    <div className="message"></div>
                    <div id="success-response" className="success-message"></div>
                    <div id="error-response" className={`validation-error-message${errorMessage ? ' error' : ''}`}>
                        {errorMessage}
                    </div>
                </div>

                <div className="contact-section">
                    <span>Your Order Number</span>
                    <input
                        type="number"
                        name="customer_contact"
                        placeholder="Enter your order number (e.g. 1, 2, 3...)"
                        required
                        min="1"
                        value={customerContact}
                        onChange={(event) => {
                            setCustomerContact(event.target.value);
                            clearError();
                        }}
                    />
                </div>
            </div>

            <div className="cart-button" style={{ marginTop: '20px', textAlign: 'center', marginBottom: '30px' }}>
                <button
                    type="button"
                    className={`confirm-order${isSubmitting ? ' loading' : ''}`}
                    disabled={isSubmitting || !items.length || !tableNumber.trim() || !customerContact.trim()}
                    onClick={submitOrder}
                >
                    <span>{isSubmitting ? 'Processing...' : 'Confirm Order'}</span>
                </button>
            </div>
        </div>
    );
}
