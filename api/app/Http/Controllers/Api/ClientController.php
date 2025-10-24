<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Services\ClientService;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function __construct(private ClientService $service) {}

    public function index(Request $r)  {
        $perPage = (int) $r->query('per_page', 50);
        $month   = $r->query('month'); // '2025-09' ko‘rinishida bo‘lsa filterlaymiz
        return $this->service->listWithStats($perPage, $month);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255',
            'telephone' => 'required|string|max:255',
            'telegram' => 'nullable|string|max:255',
        ]);
        return $this->service->create($data);
    }

    public function update(Request $r, Client $client)
    {
        $data = $r->validate([
            'name' => 'sometimes|string|max:255',
            'telephone' => 'sometimes|string|max:255',
            'telegram' => 'nullable|string|max:255',
        ]);
        return $this->service->update($client, $data);
    }

    public function destroy(Client $client)
    {
        $this->service->delete($client);
        return response()->json(['message' => 'Deleted']);
    }
}
