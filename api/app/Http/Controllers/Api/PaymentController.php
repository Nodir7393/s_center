<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $service) {}

    public function index(Request $r)
    { return $this->service->list($r->query('client_id'), $r->query('month')); }

    public function store(Request $r)
    {
        $d = $r->validate([
            'client_id' => 'required|exists:clients,id',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);
        return $this->service->create($d);
    }

    public function destroy(Payment $payment)
    { $this->service->delete($payment); return response()->json(['message' => 'Deleted']); }
}