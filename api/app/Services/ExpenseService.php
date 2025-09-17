<?php

namespace App\Services;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepository;

class ExpenseService
{
    public function __construct(private ExpenseRepository $repo) {}

    public function list(?string $month, int $perPage = 20)
    {
        return $this->repo->paginate($month, $perPage);
    }

    public function create(array $d): Expense
    {
        return $this->repo->create($d);
    }

    public function update(Expense $e, array $d): Expense
    {
        return $this->repo->update($e, $d);
    }

    public function delete(Expense $e): void
    {
        $this->repo->delete($e);
    }
}