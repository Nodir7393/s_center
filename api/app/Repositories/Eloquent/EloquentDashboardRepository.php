<?php

namespace App\Repositories\Eloquent;

use App\Models\Client;
use App\Models\DebtRecord;
use App\Models\Expense;
use App\Models\MonthlyProfit;
use App\Models\Payment;
use App\Models\Product;
use App\Repositories\Contracts\DashboardRepository;
use Carbon\Carbon;

class EloquentDashboardRepository implements DashboardRepository
{
    public function countClients()
    {
        return Client::count();
    }

    public function totalDebt(?string $month = null)
    {
        return $this->sum(DebtRecord::class, $month) - $this->sum(Payment::class, $month);
    }

    public function totalRevenue(?string $month = null)
    {
        return $this->sum(MonthlyProfit::class, $month, 'total_revenue') - $this->sum(Expense::class, $month) + $this->totalDebt($month);
    }

    public function totalExpense(?string $month = null)
    {
        return (int)$this->sum(Expense::class, $month);
    }

    public function countLessProduct()
    {
        return Product::whereColumn('stock_quantity', '<=', 'min_quantity')->count();
    }

    public function countProducts()
    {
        return Product::count();
    }

    public function allBenefit(?string $month = null)
    {
        return $this->sum(MonthlyProfit::class, $month, 'total_revenue') - $this->sum(Expense::class, $month) - $this->totalDebt($month);
    }

    private function sum(string $modelClass, ?string $month = null, string $sum = 'amount')
    {
        return $modelClass::when($month, function ($query) use ($month) {
            $date = Carbon::parse($month);
            $query->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
        })
        ->sum($sum);
    }
}