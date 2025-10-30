<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Repositories\Contracts\DashboardRepository;
use App\Repositories\Contracts\ProductRepository;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardRepository $repo,
        private readonly ProductRepository $repoProduct
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
}
