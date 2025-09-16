<?php
namespace App\Services;

use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepository;

class PaymentService
{
    public function __construct(private PaymentRepository $repo) {}

    public function list(?int $clientId, ?string $month, int $perPage = 20)
    { return $this->repo->paginate($clientId, $month, $perPage); }

    public function create(array $d): Payment { return $this->repo->create($d); }
    public function delete(Payment $p): void { $this->repo->delete($p); }
}