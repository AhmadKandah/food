<?php

namespace App\Http\Controllers\Public;

use App\Helpers\CurrencyHelper;
use App\Http\Controllers\Controller;
use App\Models\DiningTable;
use App\Models\FoodMenu;
use App\Models\FoodCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display the menu for a specific dining table
     *
     * @param string $encryptedId
     * @return \Illuminate\View\View
     */
    public function showMenu(string $encryptedId)
    {
        // Find table by encrypted ID
        $table = DiningTable::findByEncryptedId($encryptedId);
        
        if (!$table) {
            abort(404, 'Table not found');
        }
        
        // Get all food categories with their menus
        $categories = FoodCategory::with('foodMenus')->get();
        
        // Get all food menus for fallback
        $foodMenus = FoodMenu::all();
        
        return view('public.table-menu', compact('table', 'categories', 'foodMenus'));
    }
    
    /**
     * Display the menu for a specific dining table using short code
     *
     * @param string $code
     * @return \Illuminate\View\View
     */
    public function showMenuByCode(string $code)
    {
        // Find table by code (e.g., T-001)
        $table = DiningTable::where('code', $code)->first();
        
        if (!$table) {
            abort(404, 'Table not found');
        }
        
        // Get all food categories with their menus
        $categories = FoodCategory::with('foodMenus')->get();
        
        // Get all food menus for fallback
        $foodMenus = FoodMenu::all();
        
        return view('public.table-menu', compact('table', 'categories', 'foodMenus'));
    }
    
    /**
     * Display the menu for a specific dining table using simple table number
     *
     * @param string $tableNumber
     * @return \Illuminate\View\View
     */
    public function showMenuByTableNumber(string $tableNumber)
    {
        // Find table by table name/number
        $table = DiningTable::where('table_name', $tableNumber)->first();
        
        if (!$table) {
            abort(404, 'Table not found');
        }
        
        // Get all food categories with their menus
        $categories = FoodCategory::with('foodMenus')->get();
        
        // Get all food menus for fallback
        $foodMenus = FoodMenu::all();
        
        return view('public.table-menu', compact('table', 'categories', 'foodMenus'));
    }

    public function menuApiByEncryptedId(string $encryptedId): JsonResponse
    {
        $table = DiningTable::findByEncryptedId($encryptedId);

        if (!$table) {
            abort(404, 'Table not found');
        }

        return $this->menuApiResponse($table);
    }

    public function menuApiByCode(string $code): JsonResponse
    {
        $table = DiningTable::where('code', $code)->first();

        if (!$table) {
            abort(404, 'Table not found');
        }

        return $this->menuApiResponse($table);
    }

    public function menuApiByTableNumber(string $tableNumber): JsonResponse
    {
        $table = DiningTable::where('table_name', $tableNumber)->first();

        if (!$table) {
            abort(404, 'Table not found');
        }

        return $this->menuApiResponse($table);
    }

    private function menuApiResponse(DiningTable $table): JsonResponse
    {
        $categories = FoodCategory::with('foodMenus')->get()->map(
            fn (FoodCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'foodMenus' => $category->foodMenus->map(fn (FoodMenu $item): array => $this->menuItem($item))->values(),
            ]
        )->values();

        $foodMenus = FoodMenu::all()->map(fn (FoodMenu $item): array => $this->menuItem($item))->values();

        return response()->json([
            // Do not expose the database table id. The existing flows use one
            // of these public identifiers to resolve the table on the server.
            'table' => [
                'code' => $table->code,
                'table_number' => $table->table_name,
                'encrypted_id' => $table->encrypted_id,
            ],
            'categories' => $categories,
            'foodMenus' => $foodMenus,
            'currency' => [
                'symbol' => CurrencyHelper::symbol(),
                'code' => CurrencyHelper::code(),
                'decimals' => (int) config('currency.decimals', 2),
                'decimalSeparator' => config('currency.decimal_separator', '.'),
                'thousandsSeparator' => config('currency.thousands_separator', ','),
                'position' => config('currency.position', 'before'),
            ],
        ]);
    }

    private function menuItem(FoodMenu $item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'description' => $item->description,
            'price' => $item->price,
            'image' => $item->image,
        ];
    }
}
