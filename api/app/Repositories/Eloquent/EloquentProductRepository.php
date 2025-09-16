<?php
namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Models\StockEntry;
use App\Models\Sale;
use App\Repositories\Contracts\ProductRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EloquentProductRepository implements ProductRepository
{
    public function all() { return Product::latest()->get(); }
    public function paginate(int $perPage = 20) { return Product::latest()->paginate($perPage); }
    public function create(array $data): Product { return Product::create($data); }
    public function update(Product $p, array $d): Product { $p->update($d); return $p; }
    public function delete(Product $p): void { $p->delete(); }

    public function addStock(Product $p, int $qty, float $price, ?string $desc): StockEntry
    {
        return DB::transaction(function () use ($p, $qty, $price, $desc) {
            $entry = $p->stockEntries()->create([
                'quantity' => $qty,
                'unit_price' => $price,
                'description' => $desc,
            ]);
            $p->increment('stock_quantity', $qty);
            // Agar xohlasangiz, o'rtacha xarid narxini yangilash mumkin (oddiy: oxirgi narx)
            $p->update(['purchase_price' => $price]);
            return $entry;
        });
    }

    public function recordSale(Product $p, int $qty, float $price, ?string $desc): Sale
    {
        if ($p->stock_quantity < $qty) {
            throw ValidationException::withMessages(['quantity' => 'Omborda yetarli mahsulot yo‘q']);
        }
        return DB::transaction(function () use ($p, $qty, $price, $desc) {
            $sale = $p->sales()->create([
                'quantity' => $qty,
                'unit_price' => $price,
                'description' => $desc,
            ]);
            $p->decrement('stock_quantity', $qty);
            // istasangiz `sale_price` yangilanadi:
            $p->update(['sale_price' => $price]);
            return $sale;
        });
    }
}
