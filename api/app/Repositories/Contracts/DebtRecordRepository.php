<?php
namespace App\Repositories\Contracts;

use App\Models\DebtRecord;

interface DebtRecordRepository {
    public function paginate(?int $clientId, ?string $month, ?string $type, int $perPage = 20);
    public function create(array $data): DebtRecord;
    public function delete(DebtRecord $record): void;
}