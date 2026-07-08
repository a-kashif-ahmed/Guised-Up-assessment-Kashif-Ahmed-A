<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\PostEmbedding;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {

            $posts = Post::factory(
                rand(5, 15)
            )->create([

                'user_id' => $user->id

            ]);

            foreach ($posts as $post) {

                $vector = [];

                for ($i = 0; $i < 384; $i++) {

                    $vector[] = mt_rand(0, 1000) / 1000;

                }

                PostEmbedding::create([

                    'post_id' => $post->id,

                    'embedding' => json_encode($vector)

                ]);
            }
        }
    }
}