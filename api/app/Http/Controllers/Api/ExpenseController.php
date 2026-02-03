<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(private readonly ExpenseService $service) {}

    public function index(Request $r)
    {
        return $this->service->list($r->query('month'));
    }

    public function store(Request $r): JsonResponse
    {
        $d = $r->validate(['category' => 'required|integer|min:0|max:255', 'amount' => 'required|numeric', 'description' => 'nullable|string', 'date' => 'required|date',]);
        $expense = $this->service->create($d);
        return response()->json($expense, 201);
    }

    public function update(Request $r, Expense $expense): Expense
    {
        $d = $r->validate(['category' => 'sometimes|integer|min:0|max:255', 'amount' => 'sometimes|numeric', 'description' => 'sometimes|nullable|string', 'date' => 'sometimes|date',]);
        return $this->service->update($expense, $d);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $this->service->delete($expense);
        return response()->json(['message' => 'Deleted']);
    }
}