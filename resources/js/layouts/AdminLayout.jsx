import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import LogoutButton from '../components/common/LogoutButton';
import { useLayoutStyles } from '../utils/styles';

const adminNavigation = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'bxs-dashboard', routes: ['/admin/dashboard', '/login'] },
    { label: 'Staff Accounts', href: '/admin/staff-account', icon: 'bxs-user-rectangle', routes: ['/admin/staff-account'] },
    { label: 'Food Menus', href: '/admin/food-menu', icon: 'bxs-food-menu', routes: ['/admin/food-menu'] },
    { label: 'Restaurant', href: '/admin/restaurant', icon: 'bxs-store', routes: ['/admin/restaurant'] },
    { label: 'Partnerships', href: '/admin/partnership', icon: 'bxs-group', routes: ['/admin/partnership'] },
    { label: 'Promotions & Discounts', href: '/admin/promotion-discount', icon: 'bxs-offer', routes: ['/admin/promotion-discount'] },
];

const isActiveRoute = (pathname, routes) => routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export default function AdminLayout({ children, title = 'Admin' }) {
    const [sidebarClosed, setSidebarClosed] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin-dark-mode') === 'true');
    const { pathname } = useLocation();

    useLayoutStyles('/css/admin-style.css');
    document.title = title;

    useEffect(() => {
        const handleResize = () => setSidebarClosed(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
        localStorage.setItem('admin-dark-mode', String(darkMode));
        return () => document.body.classList.remove('dark');
    }, [darkMode]);

    useEffect(() => {
        const sectionStyle = {
            width: sidebarClosed ? 'calc(100% - 60px)' : 'calc(100% - 230px)',
            left: sidebarClosed ? '60px' : '230px',
        };
        document.querySelectorAll('section').forEach((section) => Object.assign(section.style, sectionStyle));
    }, [sidebarClosed, pathname]);

    return (
        <>
            <div className={`sidebar${sidebarClosed ? ' close' : ''}`}>
                    <Link to="/admin/dashboard" className="logo">Glaw Restaurant</Link>
                <ul className="side-menu">
                    {adminNavigation.map((item) => (
                        <li className={isActiveRoute(pathname, item.routes) ? 'active' : ''} key={item.href}>
                            <Link to={item.href}><i className={`bx ${item.icon}`}></i>{item.label}</Link>
                        </li>
                    ))}
                    <li><a href="#"><i className="bx bxs-truck"></i>Delivery Management</a></li>
                    <li><a href="#"><i className="bx bxs-receipt"></i>Billing &amp; Invoices</a></li>
                    <li><a href="#"><i className="bx bx-analyse"></i>Analytics</a></li>
                </ul>

                <ul className="side-menu">
                    <li><a href="#"><i className="bx bx-shield-quarter"></i>Access Control</a></li>
                    <li className={pathname === '/admin/settings' ? 'active' : ''}>
                        <Link to="/admin/settings"><i className="bx bx-cog"></i>Settings</Link>
                    </li>
                    <li>
                        <LogoutButton id="logout-button" />
                    </li>
                </ul>
            </div>

            <div className="top-bar">
                <nav>
                    <i className="bx bx-menu" onClick={() => setSidebarClosed((closed) => !closed)}></i>
                    <div className="right-side">
                        <input type="checkbox" id="theme-toggle" hidden checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} />
                        <label htmlFor="theme-toggle" className="theme-toggle"></label>
                        <Link to="/admin/settings" className="profile"><i className="bx bx-user-circle"></i></Link>
                    </div>
                </nav>
            </div>

            {children}
        </>
    );
}
