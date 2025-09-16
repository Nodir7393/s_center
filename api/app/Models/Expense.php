<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = ['category','amount','description','date'];
    protected $casts = ['date' => 'date:Y-m-d'];
}
