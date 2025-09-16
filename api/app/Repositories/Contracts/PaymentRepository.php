<?php
namespace App\Repositories\Contracts;

use App\Models\Payment;

interface PaymentRepository {
    public function paginate(?int $clientId, ?string $month, int $perPage = 20);
    public function create(array $data): Payment;
    public function delete(Payment $payment): void;
}