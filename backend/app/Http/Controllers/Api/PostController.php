<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Models\PostEmbedding;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    /**
     * GET /api/posts
     */
    public function index(): JsonResponse
    {
        $posts = Post::with('user')
            ->latest()
            ->paginate(20);

        return response()->json($posts);
    }

    /**
     * POST /api/posts
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Simple authenticity heuristic
        $authenticity = $this->calculateAuthenticity(
            $validated['text_content'],
            $validated['image_url'] ?? null
        );

        $post = Post::create([
            'user_id' => auth()->id(),
            'text_content' => $validated['text_content'],
            'image_url' => $validated['image_url'] ?? null,
            'authenticity_score' => $authenticity,
        ]);

        $embedding = [];

        try {

            $response = Http::timeout(5)
                ->post('http://localhost:5001/embed', [
                    'text' => $post->text_content
                ]);

            if ($response->successful()) {
                $embedding = $response->json('embedding', []);
            }

        } catch (\Throwable $e) {

            Log::warning('Embedding service unavailable', [
                'message' => $e->getMessage()
            ]);

        }

        if (!empty($embedding)) {

            PostEmbedding::create([

                'post_id' => $post->id,

                // JSON instead of pgvector
                'embedding' => json_encode($embedding)

            ]);

        }

        return response()->json([

            'success' => true,

            'message' => 'Post created successfully.',

            'data' => $post->load('user')

        ], 201);
    }

    /**
     * GET /api/posts/{post}
     */
    public function show(Post $post): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $post->load('user')
        ]);
    }

    /**
     * PUT /api/posts/{post}
     */
    public function update(StorePostRequest $request, Post $post): JsonResponse
    {
        abort_unless(
            auth()->id() === $post->user_id,
            403,
            'Unauthorized.'
        );

        $validated = $request->validated();

        $post->update([
            'text_content' => $validated['text_content'],
            'image_url' => $validated['image_url'] ?? null,
            'authenticity_score' => $this->calculateAuthenticity(
                $validated['text_content'],
                $validated['image_url'] ?? null
            )
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post updated.',
            'data' => $post
        ]);
    }

    /**
     * DELETE /api/posts/{post}
     */
    public function destroy(Post $post): JsonResponse
    {
        abort_unless(
            auth()->id() === $post->user_id,
            403,
            'Unauthorized.'
        );

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted.'
        ]);
    }

    /**
     * Simple authenticity heuristic
     */
    private function calculateAuthenticity(
        string $text,
        ?string $image = null
    ): float {

        $score = 0.4;

        $length = strlen(trim($text));

        if ($length >= 40) {
            $score += 0.3;
        }

        if ($length >= 150) {
            $score += 0.2;
        }

        if (!empty($image)) {
            $score += 0.1;
        }

        return min($score, 1.0);
    }
}