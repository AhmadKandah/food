<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\CustomerOrder;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends AdminApiController
{
    public function index(): JsonResponse
    {
        $orders = CustomerOrder::with('diningTable')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'table' => $order->diningTable?->table_name ?? '—',
                'total' => (float) $order->order_total_price,
                'status' => $order->order_status?->value ?? (string) $order->order_status,
                'date' => optional($order->created_at)->format('Y-m-d H:i'),
            ]);

        return response()->json([
            'data' => [
                'total_staff' => User::where('role', 2)->count(),
                'site_visits' => 0,
                'total_sales' => (float) CustomerOrder::where('order_status', 'Completed')->sum('order_total_price'),
                'orders' => $orders,
                'reminders' => [],
            ],
        ]);
    }
}
