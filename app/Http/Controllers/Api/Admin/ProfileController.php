<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends AdminApiController
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->profileData($request->user())]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $response = $this->validationResponse($request, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:255'],
        ]);
        if ($response) return $response;
        $user->update($request->only(['name', 'email', 'phone']));

        return response()->json(['message' => 'Profile updated successfully.', 'data' => $this->profileData($user->fresh())]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $response = $this->validationResponse($request, [
            'current_password' => ['required', 'string', 'min:6'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);
        if ($response) return $response;
        if (!Hash::check($request->input('current_password'), $request->user()->password)) {
            return response()->json(['message' => 'Your current password is incorrect.', 'errors' => ['current_password' => ['Your current password is incorrect.']]], 422);
        }
        $request->user()->update(['password' => Hash::make($request->input('new_password'))]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    private function profileData($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'staff_id' => $user->staff_id,
        ];
    }
}
