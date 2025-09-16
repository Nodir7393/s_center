<?php
namespace App\Repositories\Eloquent;

use App\Models\Client;
use App\Repositories\Contracts\ClientRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentClientRepository implements ClientRepository
{
    public function paginate(int $perPage = 20) { return Client::latest()->paginate($perPage); }

    public function paginateWithStats(int $perPage = 20, ?string $month = null): LengthAwarePaginator
    {
        $query = Client::query()
            ->select('id', 'name', 'telephone', 'telegram', 'created_at')
            // total_debt
            ->withSum(['debtRecords as total_debt' => function ($q) use ($month) {
                if ($month) {
                    $q->whereYear('created_at', substr($month, 0, 4))
                        ->whereMonth('created_at', substr($month, 5, 2));
                }
            }], 'amount')
            // paid_amount
            ->withSum(['payments as paid_amount' => function ($q) use ($month) {
                if ($month) {
                    $q->whereYear('created_at', substr($month, 0, 4))
                        ->whereMonth('created_at', substr($month, 5, 2));
                }
            }], 'amount')
            // last_payment (oxirgi to'lov vaqti)
            ->withMax(['payments as last_payment' => function ($q) use ($month) {
                if ($month) {
                    $q->whereYear('created_at', substr($month, 0, 4))
                        ->whereMonth('created_at', substr($month, 5, 2));
                }
            }], 'created_at')
            ->latest();

        // Paginatsiya + transform
        return $query->paginate($perPage)->through(function ($c) {
            $c->total_debt     = (float) ($c->total_debt ?? 0);
            $c->paid_amount    = (float) ($c->paid_amount ?? 0);
            $c->remaining_debt = $c->total_debt - $c->paid_amount;
            return $c;
        });
    }

    public function create(array $data): Client   { return Client::create($data); }
    public function update(Client $c, array $d): Client { $c->update($d); return $c; }
    public function delete(Client $c): void { $c->delete(); }
}
