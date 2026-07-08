<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    /**
     * Login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (!Auth::attempt($credentials)) {

            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);

        }

        /** @var \App\Models\User $user */
        $user = User::where('email', $credentials['email'])->first();

        // Remove old tokens if you only want one active session
        $user->tokens()->delete();

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([

            'success' => true,
            'message' => 'Login successful.',

            'token' => $token,

            'user' => $user

        ]);
    }

    /**
     * Logout current device.
     */
    public function logout(): JsonResponse
    {
        $user = Auth::user();

        if ($user) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Logout all devices.
     */
    public function logoutAll(): JsonResponse
    {
        $user = Auth::user();

        if ($user) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices.',
        ]);
    }

    /**
     * Current authenticated user.
     */
    public function me(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Refresh token.
     */
    public function refresh(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {

            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);

        }

        $user->currentAccessToken()->delete();

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([

            'success' => true,

            'token' => $token,

            'user' => $user

        ]);
    }
}