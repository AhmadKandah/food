<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicApiController;
use App\Http\Controllers\Public\OrderController;
use App\Http\Controllers\Public\PublicController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\FoodMenuController as AdminFoodMenuController;
use App\Http\Controllers\Api\Admin\PartnershipController as AdminPartnershipController;
use App\Http\Controllers\Api\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Api\Admin\PromotionController as AdminPromotionController;
use App\Http\Controllers\Api\Admin\RestaurantController as AdminRestaurantController;
use App\Http\Controllers\Api\Admin\StaffAccountController as AdminStaffAccountController;
use App\Http\Controllers\Api\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Api\Staff\DiningTableController as StaffDiningTableController;
use App\Http\Controllers\Api\Staff\OrderController as StaffOrderController;
use App\Http\Controllers\Api\Staff\ProfileController as StaffProfileController;
use App\Http\Controllers\Api\Staff\ReservationController as StaffReservationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

Route::get('/menu', [PublicApiController::class, 'menu']);
Route::get('/promotions', [PublicApiController::class, 'promotions']);
Route::post('/reservations', [PublicController::class, 'makeReservationApi']);
Route::post('/orders', [PublicController::class, 'createOrder']);

Route::get('/table-menu/order/table/{encryptedId}', [OrderController::class, 'menuApiByEncryptedId']);
Route::get('/table-menu/t/{code}', [OrderController::class, 'menuApiByCode']);
Route::get('/table-menu/table/{tableNumber}', [OrderController::class, 'menuApiByTableNumber']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// React Admin API. Every endpoint is session/token authenticated and restricted
// to role 1 by the JSON-specific middleware.
Route::prefix('admin')->middleware(['auth:sanctum', 'isAdminApi'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    Route::get('/staff', [AdminStaffAccountController::class, 'index']);
    Route::post('/staff', [AdminStaffAccountController::class, 'store']);
    Route::get('/staff/{id}', [AdminStaffAccountController::class, 'show']);
    Route::match(['put', 'post'], '/staff/{id}', [AdminStaffAccountController::class, 'update']);
    Route::delete('/staff/{id}', [AdminStaffAccountController::class, 'destroy']);
    Route::get('/staff-ids', [AdminStaffAccountController::class, 'ids']);
    Route::post('/staff-ids', [AdminStaffAccountController::class, 'storeId']);
    Route::delete('/staff-ids/{id}', [AdminStaffAccountController::class, 'destroyId']);

    Route::get('/food-menus', [AdminFoodMenuController::class, 'index']);
    Route::post('/food-menus', [AdminFoodMenuController::class, 'store']);
    Route::get('/food-menus/{id}', [AdminFoodMenuController::class, 'show']);
    Route::match(['put', 'post'], '/food-menus/{id}', [AdminFoodMenuController::class, 'update']);
    Route::delete('/food-menus/{id}', [AdminFoodMenuController::class, 'destroy']);
    Route::get('/food-categories', [AdminFoodMenuController::class, 'categories']);
    Route::post('/food-categories', [AdminFoodMenuController::class, 'storeCategory']);
    Route::delete('/food-categories/{id}', [AdminFoodMenuController::class, 'destroyCategory']);

    Route::get('/restaurant-items', [AdminRestaurantController::class, 'index']);
    Route::post('/restaurant-items', [AdminRestaurantController::class, 'store']);
    Route::get('/restaurant-items/{id}', [AdminRestaurantController::class, 'show']);
    Route::match(['put', 'post'], '/restaurant-items/{id}', [AdminRestaurantController::class, 'update']);
    Route::delete('/restaurant-items/{id}', [AdminRestaurantController::class, 'destroy']);
    Route::get('/item-categories', [AdminRestaurantController::class, 'categories']);
    Route::post('/item-categories', [AdminRestaurantController::class, 'storeCategory']);
    Route::delete('/item-categories/{id}', [AdminRestaurantController::class, 'destroyCategory']);

    Route::get('/partnerships', [AdminPartnershipController::class, 'index']);
    Route::post('/partnerships', [AdminPartnershipController::class, 'store']);
    Route::get('/partnerships/{id}', [AdminPartnershipController::class, 'show']);
    Route::match(['put', 'post'], '/partnerships/{id}', [AdminPartnershipController::class, 'update']);
    Route::delete('/partnerships/{id}', [AdminPartnershipController::class, 'destroy']);

    Route::get('/promotion-discounts', [AdminPromotionController::class, 'discounts']);
    Route::post('/promotion-discounts', [AdminPromotionController::class, 'storeDiscount']);
    Route::get('/promotion-discounts/{id}', [AdminPromotionController::class, 'showDiscount']);
    Route::match(['put', 'post'], '/promotion-discounts/{id}', [AdminPromotionController::class, 'updateDiscount']);
    Route::delete('/promotion-discounts/{id}', [AdminPromotionController::class, 'destroyDiscount']);
    Route::get('/promotion-events', [AdminPromotionController::class, 'events']);
    Route::post('/promotion-events', [AdminPromotionController::class, 'storeEvent']);
    Route::post('/promotion-events/{id}', [AdminPromotionController::class, 'updateEvent']);
    Route::delete('/promotion-events/{id}', [AdminPromotionController::class, 'destroyEvent']);

    Route::get('/profile', [AdminProfileController::class, 'show']);
    Route::match(['put', 'post'], '/profile', [AdminProfileController::class, 'update']);
    Route::match(['put', 'post'], '/password', [AdminProfileController::class, 'updatePassword']);
});

// React Staff API. Staff endpoints deliberately use a separate middleware so
// authenticated Admin users do not receive Staff data by default.
Route::prefix('staff')->middleware(['auth:sanctum', 'isStaffApi'])->group(function () {
    Route::get('/dashboard', [StaffDashboardController::class, 'index']);

    Route::get('/orders', [StaffOrderController::class, 'index']);
    Route::get('/orders/{id}', [StaffOrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [StaffOrderController::class, 'updateStatus']);

    Route::get('/dining-tables', [StaffDiningTableController::class, 'index']);
    Route::post('/dining-tables', [StaffDiningTableController::class, 'store']);
    Route::get('/dining-tables/{id}', [StaffDiningTableController::class, 'show']);

    Route::get('/reservations', [StaffReservationController::class, 'index']);
    Route::get('/reservations/{id}', [StaffReservationController::class, 'show']);
    Route::patch('/reservations/{id}/status', [StaffReservationController::class, 'updateStatus']);

    Route::get('/profile', [StaffProfileController::class, 'show']);
    Route::post('/profile', [StaffProfileController::class, 'update']);
    Route::put('/profile', [StaffProfileController::class, 'update']);
});
