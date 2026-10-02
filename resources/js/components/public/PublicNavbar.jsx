import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useCart } from '../../hooks/useCart';

const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Promotions', href: '/promotion' },
    { label: 'Reservation', href: '/reservation' },
];

export default function PublicNavbar({ onOpenCart }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(window.scrollY > 0);
    const topbarRef = useRef(null);
    const searchRef = useRef(null);
    const searchFormRef = useRef(null);
    const { totalItems } = useCart();
    const { pathname: currentPath, search: currentSearch } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setSearchTerm(new URLSearchParams(currentSearch).get('search') || '');
    }, [currentPath, currentSearch]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 0);
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
            }
        };
        const handleOutsideClick = (event) => {
            if (topbarRef.current && !topbarRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }

            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleOutsideClick);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const isActive = (href) => {
        if (href === '/') {
            return currentPath === '/';
        }

        return currentPath === href || currentPath.startsWith(`${href}/`);
    };

    const submitSearch = (event) => {
        event.preventDefault();

        const value = searchTerm.trim();
        navigate(value ? `/menu?search=${encodeURIComponent(value)}` : '/menu');
        setSearchOpen(false);
    };

    return (
        <div className={`topbar${scrolled ? ' scrolled' : ''}${mobileMenuOpen ? ' nav-open' : ''}`} ref={topbarRef}>
            <div className="container">
                <div className="logo">
                    <img src="/images/logo.png" alt="Hash Logo" width="8" height="0" />
                    <span className="logo-text-main">Glaw</span>
                    <span className="logo-text-sub">Restaurant</span>
                </div>

                <div
                    className={`mobile-menu-btn${mobileMenuOpen ? ' active' : ''}`}
                    id="mobile-menu-btn"
                    onClick={(event) => {
                        event.stopPropagation();
                        setMobileMenuOpen((open) => !open);
                    }}
                >
                    <i className="bx bx-menu"></i>
                </div>

                <div className={`nav-page${mobileMenuOpen ? ' active' : ''}`} id="nav-page">
                    {navigationItems.map((item) => (
                        <div className={isActive(item.href) ? 'active' : ''} key={item.href}>
                            <a href={item.href}><span>{item.label}</span></a>
                        </div>
                    ))}
                </div>

                <div className="manage">
                    <div className="search" ref={searchRef}>
                        <i
                            className="bx bx-search"
                            id="open-search"
                            onClick={(event) => {
                                event.stopPropagation();
                                setSearchOpen((open) => !open);
                            }}
                        ></i>
                        <div className={`search-container${searchOpen ? ' active' : ''}`}>
                            <form action="/search" method="GET" id="search-form" ref={searchFormRef} onSubmit={submitSearch}>
                                <i
                                    className="bx bx-search"
                                    id="search-button"
                                    onClick={() => searchFormRef.current?.requestSubmit()}
                                ></i>
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                            </form>
                        </div>
                    </div>

                    <div
                        className="cart"
                        onClick={(event) => {
                            event.stopPropagation();
                            onOpenCart();
                        }}
                    >
                        <i className="bx bx-cart"></i>
                        <span className="cart-quantity" id="cart-quantity">{totalItems}</span>
                    </div>

                    <div className="company">
                        <a href="/login"><i className="bx bx-buildings"></i></a>
                    </div>
                </div>
            </div>
        </div>
    );
}
