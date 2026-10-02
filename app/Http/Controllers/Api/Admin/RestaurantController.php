<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\ItemCategory;
use App\Models\RestaurantItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends AdminApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = RestaurantItem::with('itemCategory');
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($builder) => $builder
                ->where('item_name', 'like', '%'.$search.'%')
                ->orWhere('quantity', 'like', '%'.$search.'%')
                ->orWhere('price', 'like', '%'.$search.'%')
                ->orWhereHas('itemCategory', fn ($category) => $category->where('name', 'like', '%'.$search.'%')));
        }
        $items = $query->latest()->paginate((int) $request->input('per_page', 10));

        return response()->json($this->paginated($items, fn (RestaurantItem $item) => $this->itemData($item)));
    }

    public function show(string $id): JsonResponse
    {
        $item = RestaurantItem::with('itemCategory')->find($id);
        return $item
            ? response()->json(['data' => $this->itemData($item, true)])
            : response()->json(['message' => 'Restaurant item not found.'], 404);
    }

    public function store(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'item_name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99999'],
            'category_id' => ['required', 'exists:item_categories,id'],
            'item_price' => ['required', 'numeric', 'decimal:2', 'min:0.01', 'max:9999999.99'],
        ]);
        if ($response) return $response;

        $item = RestaurantItem::create([
            'item_name' => $request->input('item_name'),
            'quantity' => $request->input('quantity'),
            'item_category_id' => $request->input('category_id'),
            'price' => $request->input('item_price'),
        ]);

        return response()->json(['message' => 'Restaurant item added successfully.', 'data' => $this->itemData($item->load('itemCategory'), true)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $item = RestaurantItem::find($id);
        if (!$item) return response()->json(['message' => 'Restaurant item not found.'], 404);
        $response = $this->validationResponse($request, [
            'item_name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99999'],
            'category_id' => ['required', 'exists:item_categories,id'],
            'item_price' => ['required', 'numeric', 'decimal:2', 'min:0.01', 'max:9999999.99'],
        ]);
        if ($response) return $response;
        $item->update([
            'item_name' => $request->input('item_name'),
            'quantity' => $request->input('quantity'),
            'item_category_id' => $request->input('category_id'),
            'price' => $request->input('item_price'),
        ]);

        return response()->json(['message' => 'Restaurant item updated successfully.', 'data' => $this->itemData($item->fresh()->load('itemCategory'), true)]);
    }

    public function destroy(string $id): JsonResponse
    {
        $item = RestaurantItem::find($id);
        if (!$item) return response()->json(['message' => 'Restaurant item not found.'], 404);
        $item->delete();

        return response()->json(['message' => 'Restaurant item deleted successfully.']);
    }

    public function categories(Request $request): JsonResponse
    {
        $query = ItemCategory::query();
        if ($request->filled('search')) $query->where('name', 'like', '%'.$request->input('search').'%');
        $categories = $query->latest()->paginate((int) $request->input('per_page', 5));

        return response()->json($this->paginated($categories, fn (ItemCategory $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'created_at' => optional($category->created_at)->format('Y-m-d H:i'),
        ]));
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, ['name' => ['required', 'string', 'max:255', 'unique:item_categories,name']]);
        if ($response) return $response;
        $category = ItemCategory::create(['name' => $request->input('name')]);

        return response()->json(['message' => 'Category created successfully.', 'data' => $category], 201);
    }

    public function destroyCategory(string $id): JsonResponse
    {
        $category = ItemCategory::find($id);
        if (!$category) return response()->json(['message' => 'Category not found.'], 404);
        if ($category->restaurantItem()->exists()) return response()->json(['message' => 'This category is in use and cannot be deleted.'], 409);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }

    private function itemData(RestaurantItem $item, bool $details = false): array
    {
        return [
            'id' => $item->id,
            'item_name' => $item->item_name,
            'quantity' => $item->quantity,
            'item_category_id' => $item->item_category_id,
            'category' => $item->itemCategory?->name,
            'price' => (float) $item->price,
            ...($details ? ['created_at' => optional($item->created_at)->format('Y-m-d H:i')] : []),
        ];
    }
}
