<?php
namespace App\Repositories\Eloquent;

use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepository;

class EloquentPaymentRepository implements PaymentRepository
{
    public function paginate(?int $clientId, ?string $month, int $perPage = 20)
    {
        $q = Payment::query()->latest();
        if ($clientId) $q->where('client_id', $clientId);
        if ($month)   $q->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]); // PG
        return $q->paginate($perPage);
    }

    public function recentPayments(?string $month)
    {
        $q = Payment::query()->latest('id');
        if ($month)   $q->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]); // PG
        return $q->limit(5)->get();
    }
    public function create(array $data): Payment { return Payment::create($data); }
    public function delete(Payment $p): void { $p->delete(); }
}