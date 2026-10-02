<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\StaffAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StaffAccountController extends AdminApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->where('role', 2)->with('staffAccount');
        $this->applySearch($query, $request->input('search'));
        $staff = $query->latest()->paginate((int) $request->input('per_page', 10));

        return response()->json($this->paginated($staff, fn (User $user) => $this->userData($user)));
    }

    public function show(string $id): JsonResponse
    {
        $user = User::where('role', 2)->with('staffAccount')->find($id);

        return $user
            ? response()->json(['data' => $this->userData($user, true)])
            : response()->json(['message' => 'Staff account not found.'], 404);
    }

    public function store(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'staff_id' => ['required', 'string', 'max:255', 'exists:staff_accounts,staff_account_id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
        ]);
        if ($response) return $response;
        if (User::where('staff_id', $request->input('staff_id'))->exists()) {
            return response()->json(['message' => 'This Staff ID is already assigned.'], 409);
        }

        $user = User::create([
            'staff_id' => $request->string('staff_id')->toString(),
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'phone' => $request->input('phone'),
            'position' => $request->input('position'),
            'address' => $request->input('address'),
            'password' => Hash::make($request->input('password')),
            'role' => 2,
        ]);

        return response()->json(['message' => 'Staff account created successfully.', 'data' => $this->userData($user)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::where('role', 2)->find($id);
        if (!$user) return response()->json(['message' => 'Staff account not found.'], 404);

        $response = $this->validationResponse($request, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);
        if ($response) return $response;

        $data = $request->only(['name', 'email', 'phone', 'position', 'address']);
        if ($request->filled('password')) $data['password'] = Hash::make($request->input('password'));
        $user->update($data);

        return response()->json(['message' => 'Staff account updated successfully.', 'data' => $this->userData($user->fresh())]);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::where('role', 2)->find($id);
        if (!$user) return response()->json(['message' => 'Staff account not found.'], 404);
        $user->delete();

        return response()->json(['message' => 'Staff account deleted successfully.']);
    }

    public function ids(Request $request): JsonResponse
    {
        $query = StaffAccount::query();
        if ($request->filled('search')) $query->where('staff_account_id', 'like', '%'.$request->input('search').'%');
        $accounts = $query->latest()->paginate((int) $request->input('per_page', 5));

        return response()->json($this->paginated($accounts, fn (StaffAccount $account) => [
            'id' => $account->staff_account_id,
            'staff_account_id' => $account->staff_account_id,
            'created_at' => optional($account->created_at)->format('Y-m-d H:i'),
            'assigned' => $account->user()->exists(),
        ]));
    }

    public function storeId(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'staff_id' => ['required', 'string', 'max:255', 'unique:staff_accounts,staff_account_id'],
        ]);
        if ($response) return $response;
        $account = StaffAccount::create(['staff_account_id' => $request->input('staff_id')]);

        return response()->json(['message' => 'Staff ID created successfully.', 'data' => [
            'id' => $account->staff_account_id,
            'staff_account_id' => $account->staff_account_id,
        ]], 201);
    }

    public function destroyId(string $id): JsonResponse
    {
        $account = StaffAccount::find($id);
        if (!$account) return response()->json(['message' => 'Staff ID not found.'], 404);
        if ($account->user()->exists()) return response()->json(['message' => 'This Staff ID is assigned and cannot be deleted.'], 409);
        $account->delete();

        return response()->json(['message' => 'Staff ID deleted successfully.']);
    }

    private function applySearch($query, ?string $search): void
    {
        if (!$search) return;
        $query->where(fn ($builder) => $builder
            ->where('staff_id', 'like', '%'.$search.'%')
            ->orWhere('name', 'like', '%'.$search.'%')
            ->orWhere('email', 'like', '%'.$search.'%')
            ->orWhere('phone', 'like', '%'.$search.'%'));
    }

    private function userData(User $user, bool $details = false): array
    {
        return [
            'id' => $user->id,
            'staff_id' => $user->staff_id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'position' => $user->position,
            'address' => $user->address,
            'photo' => $user->photo,
            ...($details ? ['created_at' => optional($user->created_at)->format('Y-m-d H:i')] : []),
        ];
    }
}
