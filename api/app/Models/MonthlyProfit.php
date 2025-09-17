<?php

namespace App\Models;

use App\Enums\Month;
use Illuminate\Database\Eloquent\Model;

class MonthlyProfit extends Model
{
    protected $fillable = [
        'month','total_revenue','total_expenses','total_debts_added',
        'debt_payments','product_profit','net_profit'
    ];

    protected $casts = [
        'month'             => Month::class,
        'total_revenue'     => 'decimal:2',
        'total_expenses'    => 'decimal:2',
        'total_debts_added' => 'decimal:2',
        'debt_payments'     => 'decimal:2',
        'product_profit'    => 'decimal:2',
        'net_profit'        => 'decimal:2',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    public function getMonthLabelAttribute(): string
    {
        return $this->month->label();
    }
}
