<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInteractionRequest;
use App\Models\Interaction;
use Illuminate\Http\JsonResponse;

class InteractionController extends Controller
{
    /**
     * POST /api/interactions
     * Logs a view, reply, or reaction against a post.
     * This feeds the relationship-depth ranking signal.
     */
    public function store(StoreInteractionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $interaction = Interaction::create([
            'user_id' => auth()->id(),
            'post_id' => $validated['post_id'],
            'type' => $validated['type'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Interaction logged.',
            'data' => $interaction,
        ], 201);
    }
}
