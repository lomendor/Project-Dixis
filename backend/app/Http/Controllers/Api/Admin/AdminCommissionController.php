<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionRule;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCommissionController extends Controller
{
    private function adminGuard(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
    }

    private function rules(): array
    {
        return [
            'scope_channel'         => ['required', Rule::in(['B2C','B2B','ALL'])],
            'percent'               => ['required', 'numeric', 'min:0', 'max:100'],
            'fixed_fee_cents'       => ['nullable', 'integer', 'min:0'],
            'tier_min_amount_cents' => ['required', 'integer', 'min:0'],
            'tier_max_amount_cents' => ['nullable', 'integer', 'min:0'],
            'vat_mode'              => ['required', Rule::in(['INCLUDE','EXCLUDE','NONE'])],
            'rounding_mode'         => ['required', Rule::in(['UP','DOWN','NEAREST'])],
            'effective_from'        => ['required', 'date'],
            'effective_to'          => ['nullable', 'date'],
            'priority'              => ['required', 'integer', 'min:0'],
            'scope_producer_id'     => ['nullable', 'integer', 'exists:producers,id'],
            'scope_category_id'     => ['nullable', 'integer'],
        ];
    }

    public function index(Request $request)
    {
        $this->adminGuard($request);
        $rules = CommissionRule::orderByDesc('priority')->get();
        return response()->json(['success' => true, 'rules' => $rules]);
    }

    public function store(Request $request)
    {
        $this->adminGuard($request);
        $validated = $request->validate($this->rules());
        $rule = CommissionRule::create($validated);
        return response()->json(['success' => true, 'rule' => $rule], 201);
    }

    public function update(Request $request, $id)
    {
        $this->adminGuard($request);
        $rule = CommissionRule::findOrFail($id);
        $validated = $request->validate($this->rules());
        $rule->update($validated);
        return response()->json(['success' => true, 'rule' => $rule->fresh()]);
    }

    public function toggleActive(Request $request, $id)
    {
        $this->adminGuard($request);
        $rule = CommissionRule::findOrFail($id);
        $rule->update(['active' => !$rule->active]);
        return response()->json(['success' => true, 'rule' => $rule->fresh()]);
    }

    public function preview(Request $request, CommissionService $service)
    {
        $this->adminGuard($request);
        $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'channel' => ['required', Rule::in(['B2C','B2B','ALL'])],
        ]);

        $amountCents = (int) round($request->input('amount') * 100);
        $result = $service->calculateFee((object) [
            'total_cents' => $amountCents,
            'channel'     => $request->input('channel'),
        ]);

        return response()->json(['success' => true, 'preview' => $result]);
    }
}
