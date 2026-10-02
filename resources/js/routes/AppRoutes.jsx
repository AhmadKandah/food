import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AboutPage from '../pages/public/AboutPage';
import HomePage from '../pages/public/HomePage';
import MenuPage from '../pages/public/MenuPage';
import PromotionPage from '../pages/public/PromotionPage';
import ReservationPage from '../pages/public/ReservationPage';
import TableMenuPage from '../pages/public/TableMenuPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../pages/admin/DashboardPage';
import StaffAccountIndexPage from '../pages/admin/StaffAccountIndexPage';
import StaffAccountCreatePage from '../pages/admin/StaffAccountCreatePage';
import StaffAccountShowPage from '../pages/admin/StaffAccountShowPage';
import StaffAccountEditPage from '../pages/admin/StaffAccountEditPage';
import FoodMenuIndexPage from '../pages/admin/FoodMenuIndexPage';
import FoodMenuCreatePage from '../pages/admin/FoodMenuCreatePage';
import FoodMenuShowPage from '../pages/admin/FoodMenuShowPage';
import FoodMenuEditPage from '../pages/admin/FoodMenuEditPage';
import RestaurantIndexPage from '../pages/admin/RestaurantIndexPage';
import RestaurantCreatePage from '../pages/admin/RestaurantCreatePage';
import RestaurantShowPage from '../pages/admin/RestaurantShowPage';
import RestaurantEditPage from '../pages/admin/RestaurantEditPage';
import PartnershipIndexPage from '../pages/admin/PartnershipIndexPage';
import PartnershipCreatePage from '../pages/admin/PartnershipCreatePage';
import PartnershipEditPage from '../pages/admin/PartnershipEditPage';
import PromotionDiscountIndexPage from '../pages/admin/PromotionDiscountIndexPage';
import PromotionDiscountCreatePage from '../pages/admin/PromotionDiscountCreatePage';
import PromotionDiscountShowPage from '../pages/admin/PromotionDiscountShowPage';
import PromotionDiscountEditPage from '../pages/admin/PromotionDiscountEditPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import StaffLayout from '../layouts/StaffLayout';
import StaffDashboardPage from '../pages/staff/StaffDashboardPage';
import StaffOrdersPage from '../pages/staff/StaffOrdersPage';
import StaffDiningTablesPage from '../pages/staff/StaffDiningTablesPage';
import StaffReservationsPage from '../pages/staff/StaffReservationsPage';
import StaffProfileShowPage from '../pages/staff/StaffProfileShowPage';
import StaffProfileEditPage from '../pages/staff/StaffProfileEditPage';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicLayout title="Home">
                            <HomePage />
                        </PublicLayout>
                    }
                />
                <Route path="/about" element={<PublicLayout title="About Us"><AboutPage /></PublicLayout>} />
                <Route path="/menu" element={<PublicLayout title="Menu"><MenuPage /></PublicLayout>} />
                <Route path="/promotion" element={<PublicLayout title="Promotions"><PromotionPage /></PublicLayout>} />
                <Route path="/reservation" element={<PublicLayout title="Reservation"><ReservationPage /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout title="Staff Login"><LoginPage /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout title="Staff Registration"><RegisterPage /></PublicLayout>} />
                <Route path="/forgot-password" element={<PublicLayout title="Forgot Password"><ForgotPasswordPage /></PublicLayout>} />
                <Route path="/order/table/:encryptedId" element={<TableMenuPage />} />
                <Route path="/t/:code" element={<TableMenuPage />} />
                <Route path="/table/:tableNumber" element={<TableMenuPage />} />

                <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminLayout title="Dashboard"><DashboardPage /></AdminLayout>} />
                    <Route path="/admin/staff-account" element={<AdminLayout title="Staff Account"><StaffAccountIndexPage /></AdminLayout>} />
                    <Route path="/admin/staff-account/create" element={<AdminLayout title="Create Staff ID"><StaffAccountCreatePage /></AdminLayout>} />
                    <Route path="/admin/staff-account/:id" element={<AdminLayout title="Staff Details"><StaffAccountShowPage /></AdminLayout>} />
                    <Route path="/admin/staff-account/:id/edit" element={<AdminLayout title="Edit Staff Account"><StaffAccountEditPage /></AdminLayout>} />
                    <Route path="/admin/food-menu" element={<AdminLayout title="Food Menu"><FoodMenuIndexPage /></AdminLayout>} />
                    <Route path="/admin/food-menu/create" element={<AdminLayout title="Create Food Menu"><FoodMenuCreatePage /></AdminLayout>} />
                    <Route path="/admin/food-menu/:id" element={<AdminLayout title="Food Menu Details"><FoodMenuShowPage /></AdminLayout>} />
                    <Route path="/admin/food-menu/:id/edit" element={<AdminLayout title="Edit Food Menu"><FoodMenuEditPage /></AdminLayout>} />
                    <Route path="/admin/restaurant" element={<AdminLayout title="Restaurant Items"><RestaurantIndexPage /></AdminLayout>} />
                    <Route path="/admin/restaurant/create" element={<AdminLayout title="Create Restaurant Item"><RestaurantCreatePage /></AdminLayout>} />
                    <Route path="/admin/restaurant/:id" element={<AdminLayout title="Restaurant Item"><RestaurantShowPage /></AdminLayout>} />
                    <Route path="/admin/restaurant/:id/edit" element={<AdminLayout title="Edit Restaurant Item"><RestaurantEditPage /></AdminLayout>} />
                    <Route path="/admin/partnership" element={<AdminLayout title="Partnership"><PartnershipIndexPage /></AdminLayout>} />
                    <Route path="/admin/partnership/create" element={<AdminLayout title="Create Partnership"><PartnershipCreatePage /></AdminLayout>} />
                    <Route path="/admin/partnership/:id/edit" element={<AdminLayout title="Edit Partnership"><PartnershipEditPage /></AdminLayout>} />
                    <Route path="/admin/promotion-discount" element={<AdminLayout title="Promotion and Discount"><PromotionDiscountIndexPage /></AdminLayout>} />
                    <Route path="/admin/promotion-discount/create" element={<AdminLayout title="Create Promotion"><PromotionDiscountCreatePage /></AdminLayout>} />
                    <Route path="/admin/promotion-discount/:id" element={<AdminLayout title="Coupon Details"><PromotionDiscountShowPage /></AdminLayout>} />
                    <Route path="/admin/promotion-discount/:id/edit" element={<AdminLayout title="Edit Coupon"><PromotionDiscountEditPage /></AdminLayout>} />
                    <Route path="/admin/settings" element={<AdminLayout title="Profile Settings"><AdminProfilePage /></AdminLayout>} />
                </Route>

                <Route element={<ProtectedRoute roles={['staff']} />}>
                    <Route path="/staff/dashboard" element={<StaffLayout title="Dashboard"><StaffDashboardPage /></StaffLayout>} />
                    <Route path="/staff/customer-order" element={<StaffLayout title="Customer Orders"><StaffOrdersPage /></StaffLayout>} />
                    <Route path="/staff/customer-order/create" element={<StaffLayout title="Create Dining Table"><StaffDiningTablesPage /></StaffLayout>} />
                    <Route path="/staff/customer-order/:id" element={<StaffLayout title="Customer Order"><StaffOrdersPage /></StaffLayout>} />
                    <Route path="/staff/customer-order/:id/edit" element={<StaffLayout title="Customer Order"><StaffOrdersPage /></StaffLayout>} />
                    <Route path="/staff/customer-reservation" element={<StaffLayout title="Reservation"><StaffReservationsPage /></StaffLayout>} />
                    <Route path="/staff/customer-reservation/:id" element={<StaffLayout title="Reservation"><StaffReservationsPage /></StaffLayout>} />
                    <Route path="/staff/staff-profile/:id" element={<StaffLayout title="Show Profile"><StaffProfileShowPage /></StaffLayout>} />
                    <Route path="/staff/staff-profile/:id/edit" element={<StaffLayout title="Edit Profile"><StaffProfileEditPage /></StaffLayout>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
