<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'staff_id' => ['required'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.',
                'errors' => [
                    'error-message' => ['The provided credentials do not match our records.'],
                ],
            ], 422);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255',
            'staff_id' => 'required|unique:users,staff_id|min:10',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|numeric',
            'password' => 'required|confirmed|min:6',
            'gender' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $staffId = $request->input('staff_id');

        if (!StaffAccount::where('staff_account_id', $staffId)->exists()) {
            return response()->json([
                'message' => 'Invalid ID. Please provide a valid staff ID.',
                'errors' => [
                    'error-message' => ['Invalid ID. Please provide a valid staff ID.'],
                ],
            ], 422);
        }

        if (User::where('staff_id', $staffId)->exists()) {
            return response()->json([
                'message' => 'User with the provided staff ID has already registered.',
                'errors' => [
                    'error-message' => ['User with the provided staff ID has already registered.'],
                ],
            ], 422);
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'gender' => $request->input('gender'),
            'staff_id' => $staffId,
            'password' => Hash::make($request->input('password')),
        ]);

        return response()->json([
            'message' => 'Register Successful',
            'success-message' => 'Register Successful',
            'user' => $user,
        ], 201);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please enter a valid email address.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent successfully.',
            ]);
        }

        return response()->json([
            'message' => __($status),
            'errors' => [
                'email' => [__($status)],
            ],
        ], 422);
    }
}
