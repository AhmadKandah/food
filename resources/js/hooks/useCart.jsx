import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const storageKey = 'cart';

const readCart = () => {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
        return {};
    }
};

export function CartProvider({ children }) {
    const [cart, setCart] = useState(readCart);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(cart));
    }, [cart]);

    const addItem = (item) => {
        const id = String(item.id);

        setCart((currentCart) => ({
            ...currentCart,
            [id]: currentCart[id]
                ? { ...currentCart[id], quantity: currentCart[id].quantity + 1 }
                : {
                    image: item.image,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                },
        }));
    };

    const increase = (id) => setCart((currentCart) => ({
        ...currentCart,
        [id]: currentCart[id]
            ? { ...currentCart[id], quantity: currentCart[id].quantity + 1 }
            : currentCart[id],
    }));

    const decrease = (id) => setCart((currentCart) => {
        if (!currentCart[id]) {
            return currentCart;
        }

        if (currentCart[id].quantity <= 1) {
            return currentCart;
        }

        return {
            ...currentCart,
            [id]: { ...currentCart[id], quantity: currentCart[id].quantity - 1 },
        };
    });

    const remove = (id) => setCart((currentCart) => {
        const nextCart = { ...currentCart };
        delete nextCart[id];
        return nextCart;
    });

    const clear = () => {
        setCart({});
        localStorage.removeItem(storageKey);
    };

    const value = useMemo(() => {
        const items = Object.entries(cart).map(([id, item]) => ({ id, ...item }));
        const totalItems = items.reduce((total, item) => total + Number(item.quantity), 0);
        const totalAmount = items.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);

        return {
            cart,
            items,
            totalItems,
            totalAmount,
            addItem,
            increase,
            decrease,
            remove,
            clear,
        };
    }, [cart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used inside CartProvider.');
    }

    return context;
}
