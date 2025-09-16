<?php
namespace App\Services;

use App\Models\DebtRecord;
use App\Repositories\Contracts\DebtRecordRepository;

class DebtRecordService
{
    public function __construct(private DebtRecordRepository $repo) {}

    public function list(?int $clientId, ?string $month, ?string $type, int $perPage = 20)
    { return $this->repo->paginate($clientId, $month, $type, $perPage); }

    public function create(array $d): DebtRecord { return $this->repo->create($d); }
    public function delete(DebtRecord $r): void { $this->repo->delete($r); }
}