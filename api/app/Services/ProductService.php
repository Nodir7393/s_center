<?php
namespace App\Services;

use App\Models\{
    Product,
    Sale,
    StockEntry
};
use App\Repositories\Contracts\ProductRepository;

class ProductService
{
    public function __construct(private ProductRepository $repo) {}

    public function list(int $perPage = 20) { return $this->repo->paginate($perPage); }
    public function all() { return $this->repo->all(); }
    public function create(array $d): Product { return $this->repo->create($d); }
    public function update(Product $p, array $d): Product { return $this->repo->update($p, $d); }
    public function delete(Product $p): void { $this->repo->delete($p); }

    public function addStock(Product $p, int $qty, float $price, ?string $desc): StockEntry
    { return $this->repo->addStock($p, $qty, $price, $desc); }

    public function recordSale(Product $p, int $qty, float $price, ?string $desc): Sale
    { return $this->repo->recordSale($p, $qty, $price, $desc); }
}
