<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\FoodMenu\FoodCategoryController;
use App\Http\Controllers\Admin\FoodMenu\FoodMenuController;
use App\Http\Controllers\Admin\Partnership\PartnershipController;
use App\Http\Controllers\Admin\PromotionDiscount\PromotionDiscountController;
use App\Http\Controllers\Admin\PromotionDiscount\PromotionEventController;
use App\Http\Controllers\Admin\Restaurant\ItemCategoryController;
use App\Http\Controllers\Admin\Restaurant\RestaurantController;
use App\Http\Controllers\Admin\Settings\AdminProfileController;
use App\Http\Controllers\Admin\StaffAccount\StaffAccountController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegistrationController;
use App\Http\Controllers\Public\PublicController;
use App\Http\Controllers\Staff\Order\OrderControler;
use App\Http\Controllers\Staff\Profile\StaffProfileController;
use App\Http\Controllers\Staff\Reservation\ReservationController;
use App\Http\Controllers\Staff\StaffController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/


// Public Route
// React is mounted through a minimal technical host document. The old Blade
// home view remains in place as a migration reference until the full frontend
// migration is complete.
Route::view('/', 'react-app')->name('home');
Route::view('/menu', 'react-app')->name('menu');
Route::view('/about', 'react-app')->name('about');
Route::view('/promotion', 'react-app')->name('promotion');
Route::view('/reservation', 'react-app')->name('reservation');

// Add to cart
Route::post('/menu/create-order', [PublicController::class, 'createOrder'])->name('create-order');

// Search
Route::get('/search', [PublicController::class, 'search'])->name('search');

// Make reservation
Route::post('/reservation/create', [PublicController::class, 'makeReservation'])->name('create-reservation');

// Test image upload diagnostic endpoint. Keep the old Blade file as a
// migration reference, but do not expose a Blade-based user interface.
Route::get('/test-image-upload', function () {
    return response()->json([
        'message' => 'Image upload diagnostics are available through the API.',
    ]);
})->name('test-image-upload');

// Table order menu with encrypted ID
Route::view('/order/table/{encryptedId}', 'react-app')->name('table.order');

// Table order menu with short code (simplified)
Route::view('/t/{code}', 'react-app')->name('table.short');

// Table order menu with simple table number (very simple)
Route::view('/table/{tableNumber}', 'react-app')->name('table.simple');


// Route for login
Route::view('/login', 'react-app')->name('login');
Route::post('/login', [LoginController::class, 'authenticate']);

// Route for logout
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Route for registration
Route::view('/register', 'react-app')->name('register');
Route::post('/register', [RegistrationController::class, 'store']);

Route::view('/forgot-password', 'react-app')->name('forgot-password');

// Admin page URLs now serve the React shell. The legacy Blade controllers and
// views below remain as migration references/compatibility for non-React
// requests, but no user-facing Admin GET page depends on Blade anymore.
Route::prefix('admin')->middleware('auth', 'isAdmin')->group(function () {
    Route::view('/dashboard', 'react-app')->name('react-admin-dashboard');
    Route::view('/staff-account', 'react-app')->name('react-staff-account');
    Route::view('/staff-account/create', 'react-app')->name('react-staff-account-create');
    Route::view('/staff-account/{id}/edit', 'react-app')->name('react-staff-account-edit');
    Route::view('/staff-account/{id}', 'react-app')->name('react-staff-account-show');
    Route::view('/staff-search-index', 'react-app')->name('react-staff-search-index');
    Route::view('/staff-search-create', 'react-app')->name('react-staff-search-create');

    Route::view('/food-menu', 'react-app')->name('react-food-menu');
    Route::view('/food-menu/create', 'react-app')->name('react-food-menu-create');
    Route::view('/food-menu/{id}/edit', 'react-app')->name('react-food-menu-edit');
    Route::view('/food-menu/{id}', 'react-app')->name('react-food-menu-show');
    Route::view('/food-search-index', 'react-app')->name('react-food-search-index');
    Route::view('/food-search-create', 'react-app')->name('react-food-search-create');

    Route::view('/restaurant', 'react-app')->name('react-restaurant');
    Route::view('/restaurant/create', 'react-app')->name('react-restaurant-create');
    Route::view('/restaurant/{id}/edit', 'react-app')->name('react-restaurant-edit');
    Route::view('/restaurant/{id}', 'react-app')->name('react-restaurant-show');

    Route::view('/partnership', 'react-app')->name('react-partnership');
    Route::view('/partnership/create', 'react-app')->name('react-partnership-create');
    Route::view('/partnership/{id}/edit', 'react-app')->name('react-partnership-edit');

    Route::view('/promotion-discount', 'react-app')->name('react-promotion-discount');
    Route::view('/promotion-discount/create', 'react-app')->name('react-promotion-discount-create');
    Route::view('/promotion-discount/{id}/edit', 'react-app')->name('react-promotion-discount-edit');
    Route::view('/promotion-discount/{id}', 'react-app')->name('react-promotion-discount-show');
    Route::view('/settings', 'react-app')->name('react-admin-settings');
});

// Route for admin
Route::prefix('admin')->middleware('auth', 'isAdmin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('admin-dashboard');

    // Staff account module
    Route::resource('/staff-account', StaffAccountController::class)->names([
        'index' => 'staff-account',
        'create' => 'staff-account-create',
        'show' => 'staff-account-show',
        'edit' => 'staff-account-edit',
    ]);

    // Route for search in staff account module
    Route::get('/staff-search-index', [StaffAccountController::class, 'search_index'])->name('staff-account-search-index');
    Route::get('/staff-search-create', [StaffAccountController::class, 'search_create'])->name('staff-account-search-create');

    // Food menu module
    Route::resource('/food-menu', FoodMenuController::class)->names([
        'index' => 'food-menu',
        'create' => 'food-menu-create',
        'show' => 'food-menu-show',
        'edit' => 'food-menu-edit',
    ]);

    Route::post('/food-category/create', [FoodCategoryController::class, 'store'])->name('food-category');
    Route::delete('/food-category-delete/{id}', [FoodCategoryController::class, 'destroy'])->name('food-category-delete');
    Route::get('/food-search-index', [FoodMenuController::class, 'search_index'])->name('food-menu-search-index');
    Route::get('/food-search-create', [FoodMenuController::class, 'search_create'])->name('food-menu-search-create');

    // Restaurant module
    Route::resource('/restaurant', RestaurantController::class)->names([
        'index' => 'restaurant',
        'create' => 'restaurant-create',
        'show' => 'restaurant-show',
        'edit' => 'restaurant-edit',
    ]);

    Route::post('/restaurant/create', [ItemCategoryController::class, 'store'])->name('item-category');
    Route::delete('/item-category-delete/{id}', [ItemCategoryController::class, 'destroy'])->name('item-category-delete');

    // Partnership module
    Route::resource('/partnership', PartnershipController::class)->names([
        'index' => 'partnership',
        'create' => 'partnership-create',
        'edit' => 'partnership-edit',
    ]);

    // Promotion and discount module
    Route::resource('/promotion-discount', PromotionDiscountController::class)->names([
        'index' => 'promotion-discount',
        'create' => 'promotion-discount-create',
        'show' => 'promotion-discount-show',
        'edit' => 'promotion-discount-edit',
    ]);

    Route::post('/promotion-discount/create', [PromotionEventController::class, 'store'])->name('promotion-event');

    // Setting Profile
    Route::get('/settings', [AdminProfileController::class, 'adminProfile'])->name('admin-profile');
    Route::put('/settings/update-profile/{id}', [AdminProfileController::class, 'updateProfile'])->name('update-admin-profile');
    Route::put('/settings/update-password/{id}', [AdminProfileController::class, 'updatePassword'])->name('update-admin-password');
});

// Staff GET routes now serve the React shell. The legacy Staff Blade files and
// controllers remain below as migration references/compatibility only.
Route::prefix('staff')->middleware('auth', 'isStaff')->group(function () {
    Route::view('/dashboard', 'react-app')->name('react-staff-dashboard');
    Route::view('/customer-order', 'react-app')->name('react-customer-order');
    Route::view('/customer-order/create', 'react-app')->name('react-customer-order-create');
    Route::view('/customer-order/{id}', 'react-app')->name('react-customer-order-show');
    Route::view('/customer-order/{id}/edit', 'react-app')->name('react-customer-order-edit');
    Route::view('/customer-reservation', 'react-app')->name('react-customer-reservation');
    Route::view('/customer-reservation/{id}', 'react-app')->name('react-customer-reservation-show');
    Route::view('/staff-profile/{id}/edit', 'react-app')->name('react-staff-profile-edit');
    Route::view('/staff-profile/{id}', 'react-app')->name('react-staff-profile-show');
});

// Route for staff
Route::prefix('staff')->middleware('auth', 'isStaff')->group(function () {
    Route::get('/dashboard', [StaffController::class, 'index'])->name('staff-dashboard');

    // Profile module
    Route::resource('/staff-profile', StaffProfileController::class)->names([
        'show' => 'staff-profile-show',
        'edit' => 'staff-profile-edit',
    ]);

    // Order module
    Route::resource('/customer-order', OrderControler::class)->names([
        'index' => 'customer-order',
        'create' => 'customer-order-create',
        'show' => 'customer-order-show',      // Not used yet
        'edit' => 'customer-order-edit',      // Not used yet
    ]);

    Route::put('/customer-order/update-order/{id}', [OrderControler::class, 'updateStatus'])->name('update-order');


    // Reservation module
    Route::resource('/customer-reservation', ReservationController::class)->names([
        'index' => 'customer-reservation',
        'create' => 'customer-reservation-create',
        'show' => 'customer-reservation-show',
        'edit' => 'customer-reservation-edit',
    ]);

});
