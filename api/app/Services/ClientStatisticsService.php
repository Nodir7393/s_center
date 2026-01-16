<?php

namespace App\Services;

use App\Models\Client;
use App\Models\DebtRecord;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class ClientStatisticsService
{
    /**
     * Umumiy oylik statistika
     */
    public function getMonthlyStats(?string $month): array
    {
        $debtQuery = DebtRecord::query();
        $paymentQuery = Payment::query();

        if ($month) {
            $debtQuery->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]);
            $paymentQuery->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]);
        }

        $totalDebts = (float) $debtQuery->sum('amount');
        $totalPayments = (float) $paymentQuery->sum('amount');

        return [
            'total_debts' => $totalDebts,
            'total_payments' => $totalPayments,
            'remaining_debt' => $totalDebts - $totalPayments,
            'month' => $month ?? 'all',
        ];
    }

    /**
     * Bitta mijozning to'liq tarixi va statistikasi
     */
    public function getClientHistory(int $clientId, ?string $month): array
    {
        $client = Client::findOrFail($clientId);

        // Qarzlar
        $debtsQuery = DebtRecord::where('client_id', $clientId)->latest('created_at');
        // To'lovlar
        $paymentsQuery = Payment::where('client_id', $clientId)->latest('created_at');

        if ($month) {
            $debtsQuery->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]);
            $paymentsQuery->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]);
        }

        $debts = $debtsQuery->get()->map(fn($d) => [
            'id' => $d->id,
            'type' => 'debt',
            'amount' => (float) $d->amount,
            'description' => $d->description,
            'date' => $d->created_at->toISOString(),
        ]);

        $payments = $paymentsQuery->get()->map(fn($p) => [
            'id' => $p->id,
            'type' => 'payment',
            'amount' => (float) $p->amount,
            'description' => $p->description,
            'date' => $p->created_at->toISOString(),
        ]);

        // Tarixni birlashtirish va sanaga ko'ra tartiblash
        $history = $debts->concat($payments)
            ->sortByDesc('date')
            ->values()
            ->all();

        // Statistikani hisoblash
        $totalDebts = $debts->sum('amount');
        $totalPayments = $payments->sum('amount');

        return [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
            ],
            'statistics' => [
                'total_debts' => $totalDebts,
                'total_payments' => $totalPayments,
                'remaining_debt' => $totalDebts - $totalPayments,
            ],
            'history' => $history,
            'month' => $month ?? 'all',
        ];
    }
}