<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'telegram' => ['required','string'],
            'password' => ['required','string'],
            'device_name' => ['sometimes','string','max:100'],
        ]);

        $user = User::where('telegram', $data['telegram'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Telegram yoki parol noto\'g\'ri.',
                'errors' => [
                    'telegram' => ['Telegram yoki parol noto\'g\'ri.']
                ]
            ], 401);
        }

        if (isset($user->is_active) && !$user->is_active) {
            return response()->json([
                'message' => 'Sizning hisobingiz faol emas.',
                'errors' => [
                    'telegram' => ['Sizning hisobingiz faol emas.']
                ]
            ], 403);
        }

        // Delete all existing tokens for this user
        $user->tokens()->delete();

        // Create new token
        $abilities = ['*']; // kerak bo‘lsa scope belgilang
        $device    = $data['device_name'] ?? 'web';
        $token     = $user->createToken($device, $abilities)->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'telegram' => $user->telegram,
            ],
            'token' => $token,
            'message' => 'Muvaffaqiyatli kirdingiz'
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Delete current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Muvaffaqiyatli chiqdingiz'
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'telegram' => $request->user()->telegram,
            ],
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'telegram' => $user->telegram,
            ],
            'token' => $token,
            'message' => 'Token yangilandi'
        ]);
    }
}
