<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

abstract class StaffApiController extends Controller
{
    protected function validationResponse(Request $request, array $rules, array $messages = [])
    {
        $validator = Validator::make($request->all(), $rules, $messages);

        return $validator->fails()
            ? response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422)
            : null;
    }

    protected function paginated($paginator, callable $transform): array
    {
        return [
            'data' => collect($paginator->items())->map($transform)->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];
    }

    protected function storeImage($file, string $directory): string
    {
        $target = public_path($directory);
        if (!is_dir($target)) mkdir($target, 0755, true);
        $filename = $file->hashName();
        $file->move($target, $filename);

        return trim($directory, '/').'/'.$filename;
    }

    protected function deleteImage(?string $path): void
    {
        if (!$path) return;
        $publicPath = public_path(ltrim($path, '/'));
        if (File::exists($publicPath)) File::delete($publicPath);
    }

    protected function orderData($order): array
    {
        return [
            'id' => $order->id,
            'table_number' => $order->diningTable?->table_name,
            'table_code' => $order->diningTable?->code,
            'customer_contact' => $order->customer_contact,
            'is_paid' => (bool) $order->isPaid,
            'order_status' => $order->order_status?->value ?? (string) $order->order_status,
            'order_total_price' => (float) $order->order_total_price,
            'created_at' => optional($order->created_at)->format('Y-m-d H:i'),
            'items' => $order->customerOrderDetail->map(fn ($detail) => [
                'id' => $detail->food_id,
                'name' => $detail->foodMenu?->name,
                'quantity' => (int) $detail->quantity,
                'total_price' => (float) $detail->total_price,
            ])->values(),
        ];
    }
}
