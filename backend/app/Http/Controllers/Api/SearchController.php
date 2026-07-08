<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    /**
     * GET /api/search?q=hello
     * Uses pgvector's native cosine distance operator (<=>) at the SQL
     * level instead of pulling every post into PHP to compute similarity.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:2']]);
        $query = trim($request->q);

        try {
            $response = Http::timeout(5)->post('http://localhost:5001/embed', ['text' => $query]);

            if (!$response->successful()) {
                return response()->json(['success' => false, 'message' => 'Embedding service unavailable.'], 500);
            }

            $queryEmbedding = $response->json('embedding');
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            return response()->json(['success' => false, 'message' => 'Unable to generate embedding.'], 500);
        }

        $vectorLiteral = '[' . implode(',', $queryEmbedding) . ']';

        $results = DB::select('
            SELECT
                posts.id,
                posts.text_content,
                posts.image_url,
                posts.created_at,
                posts.authenticity_score,
                users.id as user_id,
                users.name as user_name,
                users.email as user_email,
                1 - (post_embeddings.embedding <=> ?::vector) AS semantic_score
            FROM posts
            JOIN post_embeddings ON post_embeddings.post_id = posts.id
            JOIN users ON users.id = posts.user_id
            ORDER BY post_embeddings.embedding <=> ?::vector ASC
            LIMIT 10
        ', [$vectorLiteral, $vectorLiteral]);

        $data = array_map(fn ($row) => [
            'id' => $row->id,
            'text_content' => $row->text_content,
            'image_url' => $row->image_url,
            'created_at' => $row->created_at,
            'authenticity_score' => $row->authenticity_score,
            'semantic_score' => round($row->semantic_score, 4),
            'user' => [
                'id' => $row->user_id,
                'name' => $row->user_name,
                'email' => $row->user_email,
            ],
        ], $results);

        return response()->json([
            'success' => true,
            'query' => $query,
            'count' => count($data),
            'data' => $data,
        ]);
    }
}
