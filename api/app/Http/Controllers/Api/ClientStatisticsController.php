<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClientStatisticsService;
use Illuminate\Http\Request;

class ClientStatisticsController extends Controller
{
    public function __construct(private ClientStatisticsService $service) {}

    /**
     * Umumiy oylik statistika
     * GET /api/statistics/monthly?month=2025-01
     */
    public function monthlyStats(Request $r)
    {
        return response()->json(
            $this->service->getMonthlyStats($r->query('month'))
        );
    }

    /**
     * Bitta mijozning tarixi va statistikasi
     * GET /api/clients/{clientId}/history?month=2025-01
     */
    public function clientHistory(Request $r, int $clientId)
    {
        return response()->json(
            $this->service->getClientHistory($clientId, $r->query('month'))
        );
    }
}