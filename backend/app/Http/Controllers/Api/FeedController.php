<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FeedRankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    protected FeedRankingService $feedRankingService;

    public function __construct(FeedRankingService $feedRankingService)
    {
        $this->feedRankingService = $feedRankingService;
    }

    /**
     * GET /api/feed?page=1&per_page=20
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $page = max((int) $request->get('page', 1), 1);
        $perPage = min(max((int) $request->get('per_page', 20), 1), 50);

        $feed = $this->feedRankingService
            ->rankFeedForUser($user, $page, $perPage);

        return response()->json([
            'success' => true,

            'current_page' => $page,

            'per_page' => $perPage,

            'has_more' => $feed['has_more'],

            'count' => count($feed['data']),

            'data' => collect($feed['data'])->map(function ($post) {

                return [

                    'id' => $post->id,

                    'text_content' => $post->text_content,

                    'image_url' => $post->image_url,

                    'authenticity_score' => round(
                        $post->authenticity_score,
                        2
                    ),

                    'score' => round(
                        $post->score,
                        4
                    ),

                    'created_at' => $post->created_at,

                    'user' => [

                        'id' => $post->user->id,

                        'name' => $post->user->name,

                        'email' => $post->user->email,

                    ]

                ];

            })

        ]);
    }

    /**
     * GET /api/feed/refresh
     *
     * Mobile app can call this when user pulls to refresh.
     */
    public function refresh(Request $request): JsonResponse
    {
        return $this->index($request);
    }

    /**
     * GET /api/feed/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $feed = $this->feedRankingService
            ->rankFeedForUser($user, 1, 500);

        $posts = collect($feed['data']);

        return response()->json([

            'success' => true,

            'statistics' => [

                'total_posts' => $posts->count(),

                'average_score' => round(

                    $posts->avg('score'),

                    4

                ),

                'highest_score' => round(

                    $posts->max('score'),

                    4

                ),

                'lowest_score' => round(

                    $posts->min('score'),

                    4

                )

            ]

        ]);
    }
}