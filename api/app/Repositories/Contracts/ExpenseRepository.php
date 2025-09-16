<?php
namespace App\Repositories\Contracts;

use App\Models\Expense;

interface ExpenseRepository {
    public function paginate(?string $month, int $perPage = 20);
    public function create(array $data): Expense;
    public function update(Expense $expense, array $data): Expense;
    public function delete(Expense $expense): void;
}