<?php
namespace App\Repositories\Contracts;

use App\Models\Product;
use App\Models\StockEntry;
use App\Models\Sale;

interface ProductRepository {
    public function all();
    public function paginate(int $perPage = 20);
    public function create(array $data): Product;
    public function update(Product $product, array $data): Product;
    public function delete(Product $product): void;

    public function addStock(Product $product, int $qty, float $price, ?string $desc): StockEntry;
    public function recordSale(Product $product, int $qty, float $price, ?string $desc): Sale;
    public function lessProducts();
}
