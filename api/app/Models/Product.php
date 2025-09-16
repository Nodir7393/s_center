<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name','category','purchase_price','sale_price','stock_quantity','min_quantity'
    ];

    protected $casts = [
        'category'       => 'integer',
        'purchase_price' => 'float',
        'sale_price'     => 'float',
        'stock_quantity' => 'integer',
        'min_quantity'   => 'integer',
        'created_at'     => 'datetime',
        'updated_at'     => 'datetime',
    ];


    public function stockEntries() { return $this->hasMany(StockEntry::class); }
    public function sales()        { return $this->hasMany(Sale::class); }
}
