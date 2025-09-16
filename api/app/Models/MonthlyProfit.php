<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyProfit extends Model
{
    protected $fillable = [
        'month','total_revenue','total_expenses','total_debts_added',
        'debt_payments','product_profit','net_profit'
    ];
}
