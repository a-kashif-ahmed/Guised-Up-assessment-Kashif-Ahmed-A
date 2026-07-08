<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_a_post(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/posts', [
                'text_content' => 'A genuinely long and thoughtful post about my day, written from the heart.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
        ]);
    }

    public function test_guest_cannot_create_a_post(): void
    {
        $response = $this->postJson('/api/posts', [
            'text_content' => 'Should not be allowed.',
        ]);

        $response->assertStatus(401);
    }

    public function test_feed_endpoint_returns_paginated_posts_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        Post::factory()->count(25)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/feed?page=1&per_page=20');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'current_page', 'per_page', 'has_more', 'data']);

        $this->assertCount(20, $response->json('data'));
    }

    public function test_interaction_is_logged_against_a_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/interactions', [
                'post_id' => $post->id,
                'type' => 'reaction',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'reaction',
        ]);
    }

    public function test_interaction_rejects_invalid_type(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/interactions', [
                'post_id' => $post->id,
                'type' => 'not_a_real_type',
            ]);

        $response->assertStatus(422);
    }
}
