import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { tableMenuService } from '../../services/public';
import { assetUrl } from '../../utils/assets';
import { useLayoutStyles } from '../../utils/styles';
import { currencyConfig, formatCurrency } from '../../utils/currency';

export default function TableMenuPage() {
    const { encryptedId, code, tableNumber } = useParams();
    const [payload, setPayload] = useState(null);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState('');

    useLayoutStyles('/css/style.css');

    useEffect(() => {
        const styleId = 'react-table-menu-style';
        let style = document.getElementById(styleId);

        if (!style) {
            style = document.createElement('link');
            style.id = styleId;
            style.rel = 'stylesheet';
            document.head.appendChild(style);
        }

        style.href = '/css/table-menu.css';

        return () => style.remove();
    }, []);

    useEffect(() => {
        let active = true;
        setStatus('loading');
        setErrorMessage('');

        const request = encryptedId
            ? tableMenuService.byEncryptedId(encryptedId)
            : code
                ? tableMenuService.byCode(code)
                : tableMenuService.byTableNumber(tableNumber);

        request.then((response) => {
            if (!active) return;

            if (!response || typeof response !== 'object' || !response.table) {
                throw new Error('Table menu API response is unavailable.');
            }

            setPayload(response);
            setStatus('ready');
            document.title = `Menu - Table ${response.table?.code || ''}`;
        }).catch((error) => {
            if (!active) return;
            setStatus('error');
            setErrorMessage(error.userMessage || 'Table not found.');
        });

        return () => {
            active = false;
        };
    }, [code, encryptedId, tableNumber]);

    const menuView = useMemo(() => {
        if (!payload) {
            return { sections: [], showEmptyFallback: false };
        }

        const categories = payload.categories || [];

        // Preserve the Blade branching exactly: fallback is used only when
        // there are no category records at all.
        if (categories.length > 0) {
            return {
                sections: categories.filter((category) => category.foodMenus?.length),
                showEmptyFallback: false,
            };
        }

        if (payload.foodMenus?.length) {
            return {
                sections: [{ id: 'fallback', name: 'Our Menu', foodMenus: payload.foodMenus }],
                showEmptyFallback: false,
            };
        }

        return { sections: [], showEmptyFallback: true };
    }, [payload]);

    const addToCart = (item) => {
        setCart((current) => {
            const existing = current.find((cartItem) => String(cartItem.id) === String(item.id));
            if (existing) {
                return current.map((cartItem) => cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem);
            }

            return [...current, {
                id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: 1,
            }];
        });

        setToast(`${item.name} added to cart!`);
        window.setTimeout(() => setToast(''), 3000);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const viewCart = () => {
        if (!cart.length) {
            window.alert('Your cart is empty!');
            return;
        }

        let details = 'Your Order:\n\n';
        cart.forEach((item) => {
            details += `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}\n`;
        });
        details += `\nTotal: ${formatCurrency(cartTotal)}`;
        details += '\n\nNote: This is a demo. In a real application, you would proceed to checkout.';
        window.alert(details);
    };

    return (
        <>
            {status === 'loading' && <div className="no-items">Loading menu...</div>}
            {status === 'error' && <div className="no-items">{errorMessage}</div>}
            {status === 'ready' && (
                <div className="table-menu-container">
                    <div className="table-header">
                        <h1><i className="bx bx-restaurant"></i> Welcome to Table {payload.table?.code}</h1>
                        <p>Browse our delicious menu and place your order</p>
                    </div>

                    <div className="menu-categories">
                        {menuView.sections.length > 0 ? menuView.sections.map((category) => (
                            <div className="category-section" key={category.id}>
                                <h2 className="category-title">
                                    <i className="bx bx-food-menu"></i>
                                    {category.name}
                                </h2>
                                <div className="menu-items">
                                    {category.foodMenus.map((item) => (
                                        <div className="menu-item" key={item.id}>
                                            <div className="menu-item-image">
                                                {item.image ? (
                                                    <img src={assetUrl(item.image)} alt={item.name} />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#e9ecef' }}>
                                                        <i className="bx bx-food-menu" style={{ fontSize: '2em', color: '#6c757d' }}></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="menu-item-details">
                                                <div className="menu-item-name">{item.name}</div>
                                                <div className="menu-item-description">{item.description || 'Delicious food item'}</div>
                                                <div className="menu-item-price">{formatCurrency(item.price)}</div>
                                                <button className="add-to-cart-btn" type="button" onClick={() => addToCart(item)}>
                                                    <i className="bx bx-cart-add"></i> Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : menuView.showEmptyFallback ? (
                            <div className="category-section">
                                <div className="no-items">
                                    <i className="bx bx-info-circle" style={{ fontSize: '3em', marginBottom: '10px', display: 'block' }}></i>
                                    No menu items available at the moment.
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {status === 'ready' && (
                <div className={`cart-summary${cartCount > 0 ? ' show' : ''}`} id="cartSummary" onClick={viewCart}>
                    <i className="bx bx-cart"></i>
                    <span id="cartCount">{cartCount}</span> items - {currencyConfig.symbol}<span id="cartTotal">{cartTotal.toFixed(2)}</span>
                </div>
            )}

            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#28a745', color: 'white', padding: '15px 20px', borderRadius: '5px', zIndex: 1000, boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                    {toast}
                </div>
            )}
        </>
    );
}
