<?php

namespace App\Http\Controllers\Api\Staff;

use App\Models\CustomerOrder;
use App\Models\FoodMenu;
use Illuminate\Http\JsonResponse;

class DashboardController extends StaffApiController
{
    public function index(): JsonResponse
    {
        $orders = CustomerOrder::with(['diningTable', 'customerOrderDetail.foodMenu'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($order) => $this->orderData($order));

        return response()->json([
            'data' => [
                'total_orders' => CustomerOrder::count(),
                'total_products' => FoodMenu::count(),
                'my_savings' => 0,
                'completed_orders' => CustomerOrder::where('order_status', 'Completed')->count(),
                'pending_orders' => CustomerOrder::where('order_status', 'Preparing')->count(),
                'orders' => $orders,
            ],
        ]);
    }
}
