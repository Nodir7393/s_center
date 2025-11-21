<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\DashboardRepository;
use App\Repositories\Contracts\ExpenseRepository;
use App\Repositories\Contracts\PaymentRepository;
use App\Repositories\Contracts\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardRepository $repo,
        private readonly ProductRepository $repoProduct,
        private readonly PaymentRepository $repoPayment,
        private readonly ExpenseRepository $repoExpense
    ) {}

    public function all(): JsonResponse
    {
        return response()->successJson([
            'count_client' => $this->repo->countClients(),
            'total_debt' => $this->repo->totalDebt(),
            'total_revenue' => $this->repo->totalRevenue(),
            'total_expense' => $this->repo->totalExpense(),
            'less_product' => $this->repo->countLessProduct(),
            'count_products' => $this->repo->countProducts(),
            'all_benefit' => $this->repo->allBenefit(),
        ]);
    }

    public function lassProducts(): JsonResponse
    {
        return response()->successJson(
            $this->repoProduct->lessProducts()
        );
    }

    public function recentPayments(Request $request)
    {
        $month = $request->query('month');

        return response()->successJson(
            $this->repoPayment->recentPayments($month)
        );
    }

    public function recentExpenses(Request $request)
    {
        $month = $request->query('month');

        return response()->successJson(
            $this->repoExpense->recentExpenses($month)
        );
    }
}
