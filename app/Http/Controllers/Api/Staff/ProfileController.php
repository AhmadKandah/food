<?php

namespace App\Http\Controllers\Api\Staff;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends StaffApiController
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
            'address' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'in:Male,Female'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg', 'max:10480'],
        ]);
        if ($response) return $response;

        $data = $request->only(['name', 'email', 'phone', 'address', 'position', 'gender']);
        if ($request->hasFile('photo')) {
            if ($user->photo) $this->deleteImage($user->photo);
            $data['photo'] = $this->storeImage($request->file('photo'), 'images/profile');
        }
        $user->update($data);

        return response()->json(['message' => 'Profile updated successfully.', 'data' => $this->profileData($user->fresh())]);
    }

    private function profileData($user): array
    {
        return [
            'id' => $user->id,
            'staff_id' => $user->staff_id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'position' => $user->position,
            'gender' => $user->gender,
            'photo' => $user->photo,
        ];
    }
}
