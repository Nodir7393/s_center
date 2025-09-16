<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonthlyProfit;
use App\Services\MonthlyProfitService;
use Illuminate\Http\Request;

class ProfitController extends Controller
{
    public function __construct(private MonthlyProfitService $service) {}

    public function index(Request $r)
    { return $this->service->list($r->query('month')); }

    public function store(Request $r)
    {
        $d = $r->validate([
            'month' => 'required|integer', // masalan 202509 yoki xohlagan formatda
            'total_revenue' => 'required|numeric',
            'total_expenses' => 'required|numeric',
            'total_debts_added' => 'required|numeric',
            'debt_payments' => 'required|numeric',
            'product_profit' => 'required|numeric',
            'net_profit' => 'required|numeric',
        ]);
        return $this->service->create($d);
    }

    public function update(Request $r, MonthlyProfit $profit)
    {
        $d = $r->validate([
            'month' => 'sometimes|integer',
            'total_revenue' => 'sometimes|numeric',
            'total_expenses' => 'sometimes|numeric',
            'total_debts_added' => 'sometimes|numeric',
            'debt_payments' => 'sometimes|numeric',
            'product_profit' => 'sometimes|numeric',
            'net_profit' => 'sometimes|numeric',
        ]);
        return $this->service->update($profit, $d);
    }

    public function destroy(MonthlyProfit $profit)
    { $this->service->delete($profit); return response()->json(['message' => 'Deleted']); }
}