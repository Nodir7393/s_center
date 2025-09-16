<?php
namespace App\Services;

use App\Models\MonthlyProfit;
use App\Repositories\Contracts\MonthlyProfitRepository;

class MonthlyProfitService
{
    public function __construct(private MonthlyProfitRepository $repo) {}

    public function list(?string $month, int $perPage = 20) { return $this->repo->paginate($month, $perPage); }
    public function create(array $d): MonthlyProfit { return $this->repo->create($d); }
    public function update(MonthlyProfit $m, array $d): MonthlyProfit { return $this->repo->update($m, $d); }
    public function delete(MonthlyProfit $m): void { $this->repo->delete($m); }
}