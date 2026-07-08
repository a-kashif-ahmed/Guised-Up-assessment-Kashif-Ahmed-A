<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use App\Models\Interaction;
use Illuminate\Database\Seeder;

class InteractionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        $posts = Post::all();

        foreach ($users as $user) {

            $sample = $posts->random(
                min(30, $posts->count())
            );

            foreach ($sample as $post) {

                Interaction::create([

                    'user_id' => $user->id,

                    'post_id' => $post->id,

                    'type' => fake()->randomElement([
                        'view',
                        'reaction',
                        'reply'
                    ])

                ]);

            }

        }
    }
}   