<?php
namespace App\Repositories\Eloquent;

use App\Models\MonthlyProfit;
use App\Repositories\Contracts\MonthlyProfitRepository;

class EloquentMonthlyProfitRepository implements MonthlyProfitRepository
{
    public function paginate(?string $month, int $perPage = 20)
    {
        $q = MonthlyProfit::query()->latest();
        if ($month) $q->where('month', intval(str_replace('-', '', $month))); // masalan 202509
        return $q->paginate($perPage);
    }
    public function create(array $d): MonthlyProfit { return MonthlyProfit::create($d); }
    public function update(MonthlyProfit $m, array $d): MonthlyProfit { $m->update($d); return $m; }
    public function delete(MonthlyProfit $m): void { $m->delete(); }
}