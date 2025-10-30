<?php

namespace App\Repositories\Contracts;

interface DashboardRepository {
    public function countClients();
    public function totalDebt(?string $month = null);
    public function totalRevenue(?string $month = null);
    public function totalExpense(?string $month = null);
    public function countLessProduct();
    public function countProducts();
    public function allBenefit();
}
