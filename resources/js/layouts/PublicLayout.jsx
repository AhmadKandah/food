import React from 'react';
import { useState } from 'react';

import CartDrawer from '../components/public/CartDrawer';
import PublicFooter from '../components/public/PublicFooter';
import PublicNavbar from '../components/public/PublicNavbar';
import SuccessModal from '../components/public/SuccessModal';
import { useLayoutStyles } from '../utils/styles';

export default function PublicLayout({ children, title = 'Home' }) {
    const [cartOpen, setCartOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useLayoutStyles('/css/style.css');

    document.title = title;

    const closeSuccessModal = () => {
        setSuccessMessage('');
        window.location.reload();
    };

    return (
        <>
            <PublicNavbar onOpenCart={() => setCartOpen(true)} />
            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                onSuccess={setSuccessMessage}
            />
            {children}
            <SuccessModal message={successMessage} onClose={closeSuccessModal} />
            <PublicFooter />
        </>
    );
}
