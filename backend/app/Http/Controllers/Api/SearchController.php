<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    /**
     * GET /api/search?q=hello
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2']
        ]);

        $query = trim($request->q);

        try {

            $response = Http::timeout(5)
                ->post('http://localhost:5001/embed', [
                    'text' => $query
                ]);

            if (!$response->successful()) {

                return response()->json([
                    'success' => false,
                    'message' => 'Embedding service unavailable.'
                ], 500);

            }

            $queryEmbedding = $response->json('embedding');

        } catch (\Throwable $e) {

            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Unable to generate embedding.'
            ], 500);

        }

        $posts = Post::with([
                'user',
                'embedding'
            ])
            ->get();

        $results = [];

        foreach ($posts as $post) {

            if (!$post->embedding) {
                continue;
            }

            $embedding = json_decode(
                $post->embedding->embedding,
                true
            );

            if (!$embedding) {
                continue;
            }

            $score = $this->cosineSimilarity(
                $queryEmbedding,
                $embedding
            );

            $results[] = [

                'id' => $post->id,

                'text_content' => $post->text_content,

                'image_url' => $post->image_url,

                'created_at' => $post->created_at,

                'authenticity_score' => $post->authenticity_score,

                'semantic_score' => round($score, 4),

                'user' => [

                    'id' => $post->user->id,

                    'name' => $post->user->name,

                    'email' => $post->user->email

                ]

            ];
        }

        usort($results, function ($a, $b) {
            return $b['semantic_score'] <=> $a['semantic_score'];
        });

        return response()->json([

            'success' => true,

            'query' => $query,

            'count' => count($results),

            'data' => array_slice($results, 0, 10)

        ]);
    }

    /**
     * Cosine Similarity
     */
    private function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;

        $normA = 0.0;

        $normB = 0.0;

        foreach ($a as $i => $value) {

            $dot += $value * $b[$i];

            $normA += $value * $value;

            $normB += $b[$i] * $b[$i];

        }

        if ($normA == 0 || $normB == 0) {
            return 0;
        }

        return (($dot / (sqrt($normA) * sqrt($normB))) + 1) / 2;
    }
}