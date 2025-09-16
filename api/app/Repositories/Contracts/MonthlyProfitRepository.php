<?php
namespace App\Repositories\Contracts;

use App\Models\MonthlyProfit;

interface MonthlyProfitRepository {
    public function paginate(?string $month, int $perPage = 20);
    public function create(array $data): MonthlyProfit;
    public function update(MonthlyProfit $profit, array $data): MonthlyProfit;
    public function delete(MonthlyProfit $profit): void;
}