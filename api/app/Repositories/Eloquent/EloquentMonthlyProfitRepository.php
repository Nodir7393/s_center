<?php

namespace App\Repositories\Eloquent;

use App\Models\MonthlyProfit;
use App\Repositories\Contracts\MonthlyProfitRepository;

class EloquentMonthlyProfitRepository implements MonthlyProfitRepository
{
    public function paginate(?string $month, int $perPage = 20)
    {
        $q = MonthlyProfit::query()->latest('month');
        if ($month !== null && $month !== '' && $month !== 'all') {
            // '/profits?month=07' yoki '/profits?month=2025-07' ikkalasini ham qo'llab-quvvatlaymiz
            if (str_contains($month, '-')) {
                $month = (int) ltrim(substr($month, -2), '0'); // '2025-07' -> 7
                if ($month === 0) { $month = 1; }
            } else {
                $month = (int) $month; // '7' -> 7
            }
            $q->where('month', $month);
        }
        return $q->paginate($perPage);
    }

    public function create(array $d): MonthlyProfit
    {
        return MonthlyProfit::create($d);
    }

    public function update(MonthlyProfit $m, array $d): MonthlyProfit
    {
        $m->update($d);
        return $m;
    }

    public function delete(MonthlyProfit $m): void
    {
        $m->delete();
    }
}