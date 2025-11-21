<?php

use App\Http\Controllers\Api\{ClientController,
    DashboardController,
    DebtRecordController,
    ExpenseController,
    PaymentController,
    ProductController,
    ProfitController};
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn() => response()->json(['pong' => true, 'time' => now()->toISOString()]));

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login')->name('login');;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::apiResource('clients', ClientController::class)->only(['index','store','update','destroy']);
    Route::apiResource('expenses', ExpenseController::class)->only(['index','store','update','destroy']);

    Route::apiResource('payments', PaymentController::class)->only(['index','store','destroy']);
    Route::apiResource('debts', DebtRecordController::class)->only(['index','store','destroy']);

    Route::apiResource('products', ProductController::class)->only(['index','store','update','destroy']);
    Route::post('products/{product}/stock', [ProductController::class, 'addStock']);
    Route::post('products/{product}/sale', [ProductController::class, 'recordSale']);
    Route::get('products/{product}/stock-entries', [ProductController::class, 'stockEntries']);
    Route::get('products/{product}/sales', [ProductController::class, 'sales']);

    Route::apiResource('profits', ProfitController::class)->only(['index','store','update','destroy']);

    Route::get('dashboard/statistic', [DashboardController::class, 'all']);
    Route::get('dashboard/lass-products', [DashboardController::class, 'lassProducts']);
    Route::get('dashboard/recent-payments', [DashboardController::class, 'recentPayments']);
    Route::get('dashboard/recent-expenses', [DashboardController::class, 'recentExpenses']);
});
