<?php

namespace App\Http\Controllers\Api\Staff;

use App\Models\DiningTable;
use App\Models\RestaurantItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DiningTableController extends StaffApiController
{
    public function index(Request $request): JsonResponse
    {
        $tables = DiningTable::query()->latest()->paginate((int) $request->input('per_page', 10));

        return response()->json($this->paginated($tables, fn (DiningTable $table) => $this->tableData($table)));
    }

    public function store(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'table_number' => ['required', 'numeric'],
        ]);
        if ($response) return $response;

        $tableInventory = RestaurantItem::where('item_name', 'Dining Table')->first();
        if (!$tableInventory) {
            return response()->json(['message' => 'Dining Table inventory is not configured.'], 409);
        }

        $registered = DiningTable::count();
        if ($registered >= (int) $tableInventory->quantity) {
            return response()->json(['message' => 'All tables are already registered.'], 409);
        }

        $number = (string) $request->input('table_number');
        if (DiningTable::where('table_name', $number)->exists()) {
            return response()->json(['message' => 'Table number is already registered.', 'errors' => ['table_number' => ['Please enter another table number.']]], 422);
        }

        $table = DiningTable::create(['table_name' => $number, 'isOccupied' => false]);

        return response()->json([
            'message' => 'Table number successfully registered.',
            'data' => $this->tableData($table),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $table = DiningTable::find($id);
        return $table
            ? response()->json(['data' => $this->tableData($table)])
            : response()->json(['message' => 'Dining table not found.'], 404);
    }

    private function tableData(DiningTable $table): array
    {
        $url = $table->simple_url;
        return [
            'id' => $table->id,
            'table_number' => $table->table_name,
            'table_name' => $table->table_name,
            'code' => $table->code,
            'is_occupied' => (bool) $table->isOccupied,
            'status' => $table->isOccupied ? 'Occupied' : 'Available',
            'url' => $url,
            'short_url' => $table->short_url,
            'encrypted_url' => $table->url,
            'qr_code' => (string) QrCode::size(100)->generate($url),
        ];
    }
}
