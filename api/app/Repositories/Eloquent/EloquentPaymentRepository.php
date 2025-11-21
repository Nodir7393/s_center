<?php
namespace App\Repositories\Eloquent;

use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepository;

class EloquentPaymentRepository implements PaymentRepository
{
    public function paginate(?int $clientId, ?string $month, int $perPage = 20)
    {
        $q = Payment::query()
            ->with('client:id,name') // Client nomini olish
            ->latest('created_at');

        if ($clientId) {
            $q->where('client_id', $clientId);
        }

        if ($month) {
            $q->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]);
        }

        $paginated = $q->paginate($perPage);

        // Ma'lumotlarni formatlash
        $paginated->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'client_id' => $payment->client_id,
                'client_name' => $payment->client?->name ?? 'Noma\'lum mijoz',
                'amount' => $payment->amount,
                'description' => $payment->description,
                'created_at' => $payment->created_at,
            ];
        });

        return $paginated;
    }

    public function recentPayments(?string $month = null)
    {
        $q = Payment::query()
            ->with('client:id,name') // Client nomini olish uchun
            ->latest('created_at')   // created_at bo'yicha sortirovka
            ->limit(5);

        // Agar month parametri berilgan bo'lsa, filtrlash
        if ($month) {
            $q->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]);
        }

        return $q->get()->map(function ($payment) {
            return [
                'id' => $payment->id,
                'client_id' => $payment->client_id,
                'client_name' => $payment->client?->name ?? 'Noma\'lum mijoz',
                'amount' => $payment->amount,
                'description' => $payment->description,
                'created_at' => $payment->created_at,
            ];
        });
    }

    public function create(array $data): Payment { return Payment::create($data); }
    public function delete(Payment $p): void { $p->delete(); }
}