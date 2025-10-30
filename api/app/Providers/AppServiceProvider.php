<?php

namespace App\Providers;

use App\Macros\ResponseFactoryMixin;
use App\Repositories\Contracts\{
    ClientRepository,
    DashboardRepository,
    DebtRecordRepository,
    ExpenseRepository,
    MonthlyProfitRepository,
    PaymentRepository,
    ProductRepository
};
use App\Repositories\Eloquent\{
    EloquentClientRepository,
    EloquentDashboardRepository,
    EloquentDebtRecordRepository,
    EloquentExpenseRepository,
    EloquentMonthlyProfitRepository,
    EloquentPaymentRepository,
    EloquentProductRepository
};
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ClientRepository::class, EloquentClientRepository::class);
        $this->app->bind(ProductRepository::class, EloquentProductRepository::class);
        $this->app->bind(ExpenseRepository::class, EloquentExpenseRepository::class);
        $this->app->bind(PaymentRepository::class, EloquentPaymentRepository::class);
        $this->app->bind(DebtRecordRepository::class, EloquentDebtRecordRepository::class);
        $this->app->bind(MonthlyProfitRepository::class, EloquentMonthlyProfitRepository::class);
        $this->app->bind(DashboardRepository::class, EloquentDashboardRepository::class);
    }

    public function boot(): void
    {
        RateLimiter::for('api', fn(Request $r) => [Limit::perMinute(60)->by($r->ip())]);
        RateLimiter::for('login', fn(Request $r) => [Limit::perMinute(10)->by($r->ip())]);
        Response::mixin(new ResponseFactoryMixin());
    }
}
