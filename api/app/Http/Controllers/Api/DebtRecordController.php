<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DebtRecord;
use App\Services\DebtRecordService;
use Illuminate\Http\Request;

class DebtRecordController extends Controller
{
    public function __construct(private DebtRecordService $service) {}

    public function index(Request $r)
    { return $this->service->list($r->query('client_id'), $r->query('month'), $r->query('type')); }

    public function store(Request $r)
    {
        $d = $r->validate([
            'client_id' => 'required|exists:clients,id',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);
        return $this->service->create($d);
    }

    public function destroy(DebtRecord $debt)
    { $this->service->delete($debt); return response()->json(['message' => 'Deleted']); }
}