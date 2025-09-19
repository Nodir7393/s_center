<?php

namespace App\Services;

use App\Models\Client;
use App\Repositories\Contracts\ClientRepository;

class ClientService
{
    public function __construct(private ClientRepository $repo) {}

    public function list(int $perPage = 20)
    {
        return $this->repo->paginate($perPage);
    }

    public function listWithStats(int $perPage = 20, ?string $month = null)
    {
        return $this->repo->paginateWithStats($perPage, $month);
    }

    public function create(array $d): Client
    {
        return $this->repo->create($d);
    }

    public function update(Client $c, array $d): Client
    {
        return $this->repo->update($c, $d);
    }

    public function delete(Client $c): void
    {
        $this->repo->delete($c);
    }
}
