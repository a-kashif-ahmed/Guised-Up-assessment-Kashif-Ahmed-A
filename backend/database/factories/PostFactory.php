<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [

            'user_id' => User::factory(),

            'text_content' => fake()->realText(
                fake()->numberBetween(80, 250)
            ),

            'image_url' => fake()->boolean(30)
                ? fake()->imageUrl(640, 480)
                : null,

            'authenticity_score' => fake()->randomFloat(
                2,
                0.50,
                1.00
            ),

            'created_at' => fake()->dateTimeBetween(
                '-30 days',
                'now'
            ),

            'updated_at' => now()

        ];
    }
}