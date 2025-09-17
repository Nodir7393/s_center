<?php

namespace App\Models;

use App\Enums\CategoryExpenses;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = ['category','amount','description','date'];
    protected $casts = ['date' => 'date:Y-m-d', 'amount' => 'decimal:2'];
    protected $castsEnum = [
        'category' => CategoryExpenses::class,
    ];
    public function getCategoryLabelAttribute(): string
    {
        return CategoryExpenses::from($this->category)->label();
    }
}
