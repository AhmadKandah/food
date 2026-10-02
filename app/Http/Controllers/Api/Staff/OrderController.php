<?php

namespace App\Http\Controllers\Api\Staff;

use App\Enums\OrderStatusEnum;
use App\Models\CustomerOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends StaffApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = CustomerOrder::with(['diningTable', 'customerOrderDetail.foodMenu']);
        if ($request->filled('status')) {
            $query->where('order_status', $request->input('status'));
        } else {
            $query->where('order_status', 'Preparing');
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($builder) => $builder
                ->where('customer_contact', 'like', '%'.$search.'%')
                ->orWhereHas('diningTable', fn ($table) => $table->where('table_name', 'like', '%'.$search.'%'))
                ->orWhereHas('customerOrderDetail.foodMenu', fn ($menu) => $menu->where('name', 'like', '%'.$search.'%')));
        }

        $orders = $query->latest()->paginate((int) $request->input('per_page', 10));

        return response()->json([
            ...$this->paginated($orders, fn ($order) => $this->orderData($order)),
            'statistics' => [
                'completed' => CustomerOrder::where('order_status', 'Completed')->count(),
                'pending' => CustomerOrder::where('order_status', 'Preparing')->count(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $order = CustomerOrder::with(['diningTable', 'customerOrderDetail.foodMenu'])->find($id);

        return $order
            ? response()->json(['data' => $this->orderData($order)])
            : response()->json(['message' => 'Order not found.'], 404);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = CustomerOrder::with('diningTable')->find($id);
        if (!$order) return response()->json(['message' => 'Order not found.'], 404);

        $response = $this->validationResponse($request, [
            'status' => ['required', 'in:Completed'],
        ]);
        if ($response) return $response;
        if ($order->order_status === OrderStatusEnum::Completed) {
            return response()->json(['message' => 'Order is already completed.'], 409);
        }

        $order->update(['order_status' => OrderStatusEnum::Completed]);
        if ($order->diningTable) $order->diningTable->update(['isOccupied' => false]);

        return response()->json(['message' => 'Order status updated successfully.', 'data' => $this->orderData($order->fresh()->load(['diningTable', 'customerOrderDetail.foodMenu']))]);
    }
}
