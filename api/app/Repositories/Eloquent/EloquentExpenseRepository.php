<?php
namespace App\Repositories\Eloquent;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepository;

class EloquentExpenseRepository implements ExpenseRepository
{
    public function paginate(?string $month, int $perPage = 20)
    {
        $q = Expense::query()->latest('date');
        if ($month) $q->whereRaw("to_char(date, 'YYYY-MM') = ?", [$month]); // PG
        return $q->paginate($perPage);
    }
    public function create(array $data): Expense { return Expense::create($data); }
    public function update(Expense $e, array $d): Expense { $e->update($d); return $e; }
    public function delete(Expense $e): void { $e->delete(); }
}