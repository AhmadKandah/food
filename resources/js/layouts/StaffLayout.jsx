import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import LogoutButton from '../components/common/LogoutButton';
import { useAuth } from '../hooks/useAuth';
import { assetUrl } from '../utils/assets';
import { useLayoutStyles } from '../utils/styles';

const isActiveRoute = (pathname, route) => pathname === route || pathname.startsWith(`${route}/`);

export default function StaffLayout({ children, title = 'Staff' }) {
    const { user } = useAuth();
    const [sidebarClosed, setSidebarClosed] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { pathname } = useLocation();
    const profileRef = useRef(null);

    useLayoutStyles('/css/staff-style.css');
    document.title = title;

    useEffect(() => {
        const handleResize = () => setSidebarClosed(window.innerWidth < 768);
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleOutsideClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <>
            <div className={`sidebar${sidebarClosed ? ' close' : ''}`}>
                <div className="content">
                    <ul>
                        <li>
                            <Link to="/staff/dashboard" className="logo">
                                <img src="/images/logo.png" alt="Hash Logo" />
                                <span>Glaw Restaurant</span>
                            </Link>
                        </li>
                        <li className={isActiveRoute(pathname, '/staff/dashboard') ? 'active' : ''}>
                            <Link to="/staff/dashboard"><i className="bx bxs-dashboard"></i><span>Dashboard</span></Link>
                        </li>
                        <li className={isActiveRoute(pathname, '/staff/customer-order') ? 'active' : ''}>
                            <Link to="/staff/customer-order"><i className="bx bxs-spreadsheet"></i><span>Orders</span></Link>
                        </li>
                        <li className={isActiveRoute(pathname, '/staff/customer-reservation') ? 'active' : ''}>
                            <Link to="/staff/customer-reservation"><i className="bx bxs-book"></i><span>Reservation</span></Link>
                        </li>
                        <li><a href="#"><i className="bx bxs-message-alt-error"></i><span>Complaint</span></a></li>
                        <li><a href="#"><i className="bx bxs-dollar-circle"></i><span>Money Float</span></a></li>
                        <li><a href="#"><i className="bx bxs-dashboard"></i><span>Test4</span></a></li>
                    </ul>
                    <ul>
                        <li className="logout"><LogoutButton id="logout-button" showLabel /></li>
                    </ul>
                </div>
            </div>

            <div className="topbar">
                <div className="content">
                    <div className="menu-button" onClick={() => setSidebarClosed((closed) => !closed)}>
                        <i className="bx bx-menu"></i>
                    </div>

                    <div className="user" ref={profileRef}>
                        {user?.photo ? (
                            <img src={assetUrl(user.photo)} alt="User-Photo" className="user-profile" id="profile-menu" onClick={() => setProfileOpen((open) => !open)} />
                        ) : (
                            <i className="bx bxs-user-circle" id="profile-menu" onClick={() => setProfileOpen((open) => !open)}></i>
                        )}
                        <ul className={`toggle-profile${profileOpen ? ' active' : ''}`}>
                            <li><Link to={`/staff/staff-profile/${user?.id || ''}`}><i className="bx bxs-user-detail"></i><span>Update Profile</span></Link></li>
                            <li><a href="#"><i className="bx bxs-key"></i><span>Change Password</span></a></li>
                            <li className="logout"><LogoutButton id="logout-button-topbar" showLabel /></li>
                        </ul>
                    </div>
                </div>
            </div>

            {children}
        </>
    );
}
