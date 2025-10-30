<?php

namespace App\Macros;

use Closure;

class ResponseFactoryMixin
{
    public function successJson(): Closure
    {
        return function ($data) {
            return response()->json([
                'status' => 200,
                'success' => true,
                'data' => $data,
            ]);
        };
    }

    public function errorJson(): Closure
    {
        return function ($message, $status, $errors = null, $data = null, $code = null) {
            return response()->json([
                'status' => $code ?? $status,
                'success' => false,
                'message' => $message,
                'errors' => $errors,
                'data' => $data,
            ], $status);
        };
    }
}
