<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\FoodCategory;
use App\Models\FoodMenu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodMenuController extends AdminApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = FoodMenu::with('foodCategory');
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($builder) => $builder
                ->where('name', 'like', '%'.$search.'%')
                ->orWhere('description', 'like', '%'.$search.'%')
                ->orWhere('price', 'like', '%'.$search.'%')
                ->orWhereHas('foodCategory', fn ($category) => $category->where('name', 'like', '%'.$search.'%')));
        }
        $menus = $query->latest()->paginate((int) $request->input('per_page', 10));

        return response()->json($this->paginated($menus, fn (FoodMenu $menu) => $this->menuData($menu)));
    }

    public function show(string $id): JsonResponse
    {
        $menu = FoodMenu::with('foodCategory')->find($id);
        return $menu
            ? response()->json(['data' => $this->menuData($menu, true)])
            : response()->json(['message' => 'Food menu not found.'], 404);
    }

    public function store(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:9999'],
            'price' => ['required', 'numeric', 'decimal:2', 'min:0.01', 'max:9999.99'],
            'category_id' => ['required', 'exists:food_categories,id'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg', 'max:10480'],
        ]);
        if ($response) return $response;

        $menu = FoodMenu::create([
            ...$request->only(['name', 'description', 'price', 'category_id']),
            'image' => $request->hasFile('image') ? $this->storeImage($request->file('image'), 'images/food-menu') : null,
        ]);

        return response()->json(['message' => 'Menu added successfully.', 'data' => $this->menuData($menu->load('foodCategory'), true)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $menu = FoodMenu::find($id);
        if (!$menu) return response()->json(['message' => 'Food menu not found.'], 404);

        $response = $this->validationResponse($request, [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:9999'],
            'price' => ['required', 'numeric', 'decimal:2', 'min:0.01', 'max:9999.99'],
            'category_id' => ['required', 'exists:food_categories,id'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg', 'max:10480'],
        ]);
        if ($response) return $response;

        $data = $request->only(['name', 'description', 'price', 'category_id']);
        if ($request->hasFile('image')) {
            if ($menu->image) $this->deleteImage($menu->image);
            $data['image'] = $this->storeImage($request->file('image'), 'images/food-menu');
        }
        $menu->update($data);

        return response()->json(['message' => 'Menu updated successfully.', 'data' => $this->menuData($menu->fresh()->load('foodCategory'), true)]);
    }

    public function destroy(string $id): JsonResponse
    {
        $menu = FoodMenu::find($id);
        if (!$menu) return response()->json(['message' => 'Food menu not found.'], 404);
        if ($menu->image) $this->deleteImage($menu->image);
        $menu->delete();

        return response()->json(['message' => 'Menu deleted successfully.']);
    }

    public function categories(Request $request): JsonResponse
    {
        $query = FoodCategory::query();
        if ($request->filled('search')) $query->where('name', 'like', '%'.$request->input('search').'%');
        $categories = $query->latest()->paginate((int) $request->input('per_page', 5));

        return response()->json($this->paginated($categories, fn (FoodCategory $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'created_at' => optional($category->created_at)->format('Y-m-d H:i'),
        ]));
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, ['name' => ['required', 'string', 'max:255', 'unique:food_categories,name']]);
        if ($response) return $response;
        $category = FoodCategory::create(['name' => $request->input('name')]);

        return response()->json(['message' => 'Category created successfully.', 'data' => $category], 201);
    }

    public function destroyCategory(string $id): JsonResponse
    {
        $category = FoodCategory::find($id);
        if (!$category) return response()->json(['message' => 'Category not found.'], 404);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }

    private function menuData(FoodMenu $menu, bool $details = false): array
    {
        return [
            'id' => $menu->id,
            'name' => $menu->name,
            'description' => $menu->description,
            'price' => (float) $menu->price,
            'category_id' => $menu->category_id,
            'category' => $menu->foodCategory?->name,
            'image' => $menu->image,
            ...($details ? ['created_at' => optional($menu->created_at)->format('Y-m-d H:i')] : []),
        ];
    }
}
