<?php

namespace App\Repositories\Contracts;

use App\Models\Client;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ClientRepository {
    public function paginate(int $perPage = 20);

    /** Agregatlar bilan (total_debt, paid_amount, remaining_debt, last_payment) */
    public function paginateWithStats(int $perPage = 20, ?string $month = null): LengthAwarePaginator;
    public function create(array $data): Client;
    public function update(Client $client, array $data): Client;
    public function delete(Client $client): void;
}
