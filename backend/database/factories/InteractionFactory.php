<?php

namespace Database\Factories;

use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InteractionFactory extends Factory
{
    protected $model = Interaction::class;

    public function definition(): array
    {
        return [

            'user_id' => User::factory(),

            'post_id' => Post::factory(),

            'type' => fake()->randomElement([

                'view',

                'reaction',

                'reply'

            ]),

            'created_at' => fake()->dateTimeBetween(
                '-90 days',
                'now'
            ),

            'updated_at' => now()

        ];
    }
}