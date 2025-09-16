<?php
namespace App\Repositories\Eloquent;

use App\Models\DebtRecord;
use App\Repositories\Contracts\DebtRecordRepository;

class EloquentDebtRecordRepository implements DebtRecordRepository
{
    public function paginate(?int $clientId, ?string $month, ?string $type, int $perPage = 20)
    {
        $q = DebtRecord::query()->latest();
        if ($clientId) $q->where('client_id', $clientId);
        if ($month)    $q->whereRaw("to_char(created_at, 'YYYY-MM') = ?", [$month]); // PG
        // $type parametreni keyinchalik ishlatsangiz (add/remove) - hozircha ignore
        return $q->paginate($perPage);
    }
    public function create(array $data): DebtRecord { return DebtRecord::create($data); }
    public function delete(DebtRecord $r): void { $r->delete(); }
}