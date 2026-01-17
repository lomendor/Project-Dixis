<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

#[\PHPUnit\Framework\Attributes\CoversClass(\App\Http\Controllers\Controller::class)]
class HealthTest extends TestCase
{
    public function test_health_endpoint_returns_success(): void
    {
        $res = $this->getJson('/api/health');
        $res->assertStatus(200)->assertJsonStructure(['status']);
    }

    /**
     * Pass 52: Verify health endpoint includes payment configuration status
     */
    public function test_health_endpoint_includes_payments_status(): void
    {
        $res = $this->getJson('/api/health');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'database',
                'payments' => [
                    'cod',
                    'card' => [
                        'flag',
                        'stripe_configured',
                        'keys_present' => ['secret', 'public', 'webhook'],
                    ],
                ],
                'timestamp',
                'version',
            ]);

        // COD is always enabled
        $res->assertJsonPath('payments.cod', 'enabled');
        // Card flag should be 'disabled' or 'enabled' (string)
        $flag = $res->json('payments.card.flag');
        $this->assertContains($flag, ['enabled', 'disabled']);
    }

    /**
     * Pass 52: Verify healthz endpoint also includes payment configuration status
     */
    public function test_healthz_endpoint_includes_payments_status(): void
    {
        $res = $this->getJson('/api/healthz');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'payments' => [
                    'cod',
                    'card' => ['flag', 'stripe_configured'],
                ],
            ]);
    }

    /**
     * Pass 60: Verify health endpoint includes email configuration status
     */
    public function test_health_endpoint_includes_email_status(): void
    {
        $res = $this->getJson('/api/health');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'database',
                'payments',
                'email' => [
                    'flag',
                    'mailer',
                    'configured',
                    'keys_present' => ['resend', 'smtp_host', 'smtp_user'],
                ],
                'timestamp',
                'version',
            ]);

        // Email flag should be 'disabled' or 'enabled' (string)
        $flag = $res->json('email.flag');
        $this->assertContains($flag, ['enabled', 'disabled']);

        // Mailer should be a valid string
        $mailer = $res->json('email.mailer');
        $this->assertIsString($mailer);
    }

    /**
     * Pass 60: Verify healthz endpoint also includes email configuration status
     */
    public function test_healthz_endpoint_includes_email_status(): void
    {
        $res = $this->getJson('/api/healthz');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'email' => [
                    'flag',
                    'mailer',
                    'configured',
                ],
            ]);
    }
}
