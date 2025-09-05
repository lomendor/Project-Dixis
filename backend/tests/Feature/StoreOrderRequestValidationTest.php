<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;

class StoreOrderRequestValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create(['price' => 10.50]);
    }

    public function test_validates_required_fields()
    {
        $request = new StoreOrderRequest();
        $validator = Validator::make([], $request->rules(), $request->messages());

        $this->assertTrue($validator->fails());
        $errors = $validator->errors()->toArray();
        $this->assertArrayHasKey('items', $errors);
        $this->assertArrayHasKey('payment_method', $errors);
        $this->assertArrayHasKey('shipping_method', $errors);
        $this->assertArrayHasKey('postal_code', $errors);
        $this->assertArrayHasKey('city', $errors);
    }

    public function test_passes_validation_with_comprehensive_data()
    {
        $validData = [
            'items' => [['product_id' => $this->product->id, 'quantity' => 2]],
            'payment_method' => 'card',
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
            'shipping_address' => 'Πλατεία Συντάγματος 1, Αθήνα',
            'shipping_cost' => 5.00,
            'shipping_carrier' => 'ACS Courier',
            'shipping_eta_days' => 3,
            'postal_code' => '10563',
            'city' => 'Αθήνα',
            'notes' => 'Παραδώστε το πρωί',
        ];

        $request = new StoreOrderRequest();
        $validator = Validator::make($validData, $request->rules(), $request->messages());
        
        $this->assertFalse($validator->fails(), 
            'Validation failed: ' . json_encode($validator->errors()->toArray())
        );
    }

    public function test_validates_greek_postal_codes_and_cities()
    {
        $request = new StoreOrderRequest();
        $baseData = [
            'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
            'payment_method' => 'card', 'currency' => 'EUR', 'shipping_method' => 'HOME',
            'shipping_address' => 'Test Address', 'shipping_cost' => 5.00,
            'shipping_carrier' => 'Test', 'shipping_eta_days' => 3,
        ];

        // Invalid postal codes
        foreach (['1056', '105631', 'AB123'] as $invalidCode) {
            $data = array_merge($baseData, ['postal_code' => $invalidCode, 'city' => 'Αθήνα']);
            $validator = Validator::make($data, $request->rules(), $request->messages());
            $this->assertTrue($validator->fails());
        }

        // Invalid cities
        foreach (['A', 'City123', 'City@Name'] as $invalidCity) {
            $data = array_merge($baseData, ['postal_code' => '10563', 'city' => $invalidCity]);
            $validator = Validator::make($data, $request->rules(), $request->messages());
            $this->assertTrue($validator->fails());
        }

        // Valid combinations
        $validCombos = [
            ['postal_code' => '10563', 'city' => 'Αθήνα'],
            ['postal_code' => '12345', 'city' => 'Athens'],
            ['postal_code' => '54321', 'city' => "O'Connor"],
        ];
        
        foreach ($validCombos as $combo) {
            $data = array_merge($baseData, $combo);
            $validator = Validator::make($data, $request->rules(), $request->messages());
            $this->assertFalse($validator->fails(), "Should be valid: " . json_encode($combo));
        }
    }

    public function test_validates_enums_and_constraints()
    {
        $request = new StoreOrderRequest();
        $baseData = [
            'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
            'payment_method' => 'card', 
            'postal_code' => '10563', 
            'city' => 'Αθήνα',
            'shipping_address' => 'Test Address',
            'shipping_cost' => 5.00,
            'shipping_carrier' => 'Test Carrier', 
            'shipping_eta_days' => 3,
        ];

        // Test shipping methods
        foreach (['HOME', 'PICKUP', 'COURIER'] as $method) {
            $data = array_merge($baseData, ['shipping_method' => $method, 'currency' => 'EUR']);
            $validator = Validator::make($data, $request->rules(), $request->messages());
            $this->assertFalse($validator->fails(), "Method {$method} should be valid");
        }

        // Test currencies  
        foreach (['EUR', 'USD'] as $currency) {
            $data = array_merge($baseData, ['currency' => $currency, 'shipping_method' => 'HOME']);
            $validator = Validator::make($data, $request->rules(), $request->messages());
            $this->assertFalse($validator->fails(), "Currency {$currency} should be valid");
        }

        // Test constraints
        $invalidData = [
            ['shipping_cost' => -1], // Negative cost
            ['shipping_cost' => 1000], // Too high cost
            ['shipping_eta_days' => -1], // Negative days
            ['shipping_eta_days' => 91], // Too many days
            ['items' => []], // Empty items
            ['items' => array_fill(0, 51, ['product_id' => $this->product->id, 'quantity' => 1])], // Too many items
        ];

        foreach ($invalidData as $override) {
            $data = array_merge($baseData, ['currency' => 'EUR', 'shipping_method' => 'HOME'], $override);
            $validator = Validator::make($data, $request->rules(), $request->messages());
            $this->assertTrue($validator->fails(), "Should fail: " . json_encode($override));
        }
    }
}