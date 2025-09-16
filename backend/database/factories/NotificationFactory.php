<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['order_placed', 'order_shipped', 'refund_issued'];
        $type = $this->faker->randomElement($types);

        $payload = match($type) {
            'order_placed' => [
                'order_id' => $this->faker->numberBetween(1, 1000),
                'total_amount' => $this->faker->randomFloat(2, 10, 500),
                'message' => 'Η παραγγελία σας #' . $this->faker->numberBetween(1, 1000) . ' καταχωρήθηκε επιτυχώς!'
            ],
            'order_shipped' => [
                'order_id' => $this->faker->numberBetween(1, 1000),
                'tracking_number' => $this->faker->regexify('[A-Z]{2}[0-9]{10}'),
                'message' => 'Η παραγγελία σας #' . $this->faker->numberBetween(1, 1000) . ' έχει αποσταλεί!'
            ],
            'refund_issued' => [
                'order_id' => $this->faker->numberBetween(1, 1000),
                'refund_amount' => $this->faker->randomFloat(2, 5, 100),
                'message' => 'Έγινε επιστροφή €' . $this->faker->randomFloat(2, 5, 100) . ' για την παραγγελία #' . $this->faker->numberBetween(1, 1000)
            ]
        };

        return [
            'user_id' => User::factory(),
            'type' => $type,
            'payload' => $payload,
            'read_at' => $this->faker->optional(0.3)->dateTime(),
        ];
    }

    /**
     * Indicate that the notification is unread.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => null,
        ]);
    }

    /**
     * Indicate that the notification is read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }
}
