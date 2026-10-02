<?php

namespace App\Http\Controllers\Api;

use App\Helpers\CurrencyHelper;
use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use App\Models\FoodMenu;
use App\Models\PromotionDiscount;
use App\Models\PromotionEvent;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicApiController extends Controller
{
    public function menu(Request $request): JsonResponse
    {
        $query = FoodMenu::with('foodCategory');

        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        if ($request->filled('search')) {
            $keyword = $request->input('search');

            $query->where(function ($menuQuery) use ($keyword) {
                $menuQuery->where('name', 'like', '%' . $keyword . '%')
                    ->orWhere('description', 'like', '%' . $keyword . '%')
                    ->orWhereHas('foodCategory', function ($categoryQuery) use ($keyword) {
                        $categoryQuery->where('name', 'like', '%' . $keyword . '%');
                    });
            });
        }

        $items = $query->orderBy('name', 'asc')->get()->map(
            fn (FoodMenu $item): array => [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'price' => $item->price,
                'image' => $item->image,
                'category_id' => $item->category_id,
                'category' => $item->foodCategory ? [
                    'id' => $item->foodCategory->id,
                    'name' => $item->foodCategory->name,
                ] : null,
                // The current schema has no availability column. Existing
                // Blade therefore renders every stored item as available.
                'available' => true,
            ]
        )->values();

        $categories = FoodCategory::orderBy('name', 'asc')->get(['id', 'name']);

        return response()->json([
            'data' => $items,
            'categories' => $categories,
            'selectedCategory' => (string) $request->input('category', ''),
            'searchKeyword' => (string) $request->input('search', ''),
            'currency' => $this->currencyConfig(),
        ]);
    }

    public function promotions(): JsonResponse
    {
        $currentMonth = Carbon::now();
        $monthBefore = Carbon::now()->subMonth();

        // Keep the same month-window behavior as PublicController@promotion.
        $events = PromotionEvent::where(function ($query) use ($currentMonth, $monthBefore) {
            $query->whereMonth('event_date', '=', $currentMonth)
                ->orWhereMonth('event_date', '=', $monthBefore);
        })->get();

        $offers = FoodMenu::where('price', '>', 27.00)->get()->map(
            fn (FoodMenu $item): array => [
                'id' => $item->id,
                'name' => $item->name,
                'price' => $item->price,
                'image' => $item->image,
            ]
        )->values();

        $data = $events->map(function (PromotionEvent $event) use ($offers): array {
            $coupons = PromotionDiscount::where('event_id', $event->id)->get();

            return [
                'id' => $event->id,
                'event_name' => $event->event_name,
                'event_date' => $event->event_date,
                'event_image' => $event->event_image,
                'coupons' => $coupons->map(fn (PromotionDiscount $coupon): array => [
                    'discount' => (float) $coupon->discount,
                ])->values(),
                'offers' => $offers,
            ];
        })->values();

        return response()->json([
            'data' => $data,
            'currency' => $this->currencyConfig(),
        ]);
    }

    private function currencyConfig(): array
    {
        return [
            'symbol' => CurrencyHelper::symbol(),
            'code' => CurrencyHelper::code(),
            'decimals' => (int) config('currency.decimals', 2),
            'decimalSeparator' => config('currency.decimal_separator', '.'),
            'thousandsSeparator' => config('currency.thousands_separator', ','),
            'position' => config('currency.position', 'before'),
        ];
    }
}
