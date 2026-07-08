<?php

namespace App\Services;

use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FeedRankingService
{
    protected const WEIGHT_AUTHENTICITY = 0.25;
    protected const WEIGHT_RELATIONSHIP = 0.30;
    protected const WEIGHT_SEMANTIC = 0.30;
    protected const WEIGHT_TIME_DECAY = 0.15;
    protected const DECAY_RATE = 0.0144; // ~50% decay every 48 hours

    /**
     * Return posts for the user's feed, scored per the TSD ranking algorithm.
     */
    public function rankFeedForUser(User $user, int $page = 1, int $perPage = 20): array
    {
        $userInterestVector = $this->userInterestVector($user);
        $maxWeightedInteraction = $this->maxWeightedInteractionForUser($user);

        $candidates = Post::with('user')
            ->orderByDesc('created_at')
            ->limit(500)
            ->get();

        // Fetch all embeddings for the candidate pool in ONE query instead
        // of one query per post (pgvector returns them as text literals).
        $postIds = $candidates->pluck('id')->all();
        $embeddingRows = empty($postIds) ? collect() : DB::table('post_embeddings')
            ->whereIn('post_id', $postIds)
            ->select('post_id', DB::raw('embedding::text as embedding'))
            ->get()
            ->keyBy('post_id');

        $scored = $candidates->map(function (Post $post) use ($userInterestVector, $maxWeightedInteraction, $embeddingRows) {
            $authenticity = $post->authenticity_score ?? 0.5;
            $relationship = $this->relationshipDepth($post->user_id, $maxWeightedInteraction, $post->user_id);

            $embeddingRow = $embeddingRows->get($post->id);
            $semantic = $embeddingRow
                ? $this->semanticSimilarity($this->parseVectorLiteral($embeddingRow->embedding), $userInterestVector)
                : 0.5;

            $ageHours = now()->diffInHours($post->created_at);
            $timeDecay = exp(-self::DECAY_RATE * $ageHours);

            $post->score =
                self::WEIGHT_AUTHENTICITY * $authenticity +
                self::WEIGHT_RELATIONSHIP * $relationship +
                self::WEIGHT_SEMANTIC * $semantic +
                self::WEIGHT_TIME_DECAY * $timeDecay;

            return $post;
        })->sortByDesc('score')->values();

        $offset = ($page - 1) * $perPage;

        return [
            'data' => $scored->slice($offset, $perPage)->values(),
            'has_more' => $scored->count() > $offset + $perPage,
        ];
    }

    protected function userInterestVector(User $user): ?array
    {
        $recentPostIds = Interaction::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->pluck('post_id');

        if ($recentPostIds->isEmpty()) {
            return null;
        }

        $placeholders = implode(',', array_fill(0, $recentPostIds->count(), '?'));
        $rows = DB::select("
            SELECT embedding::text as embedding
            FROM post_embeddings
            WHERE post_id IN ($placeholders)
        ", $recentPostIds->all());

        if (empty($rows)) {
            return null;
        }

        $vectors = array_map(fn ($row) => $this->parseVectorLiteral($row->embedding), $rows);
        $dimensions = count($vectors[0]);
        $sum = array_fill(0, $dimensions, 0.0);

        foreach ($vectors as $vector) {
            foreach ($vector as $i => $value) {
                $sum[$i] += $value;
            }
        }

        return array_map(fn ($v) => $v / count($vectors), $sum);
    }

    /**
     * pgvector returns vectors as text like "[0.1,0.2,0.3]" when cast to ::text.
     */
    protected function parseVectorLiteral(string $literal): array
    {
        return array_map('floatval', explode(',', trim($literal, '[]')));
    }

    protected function semanticSimilarity(array $postVector, ?array $userInterestVector): float
    {
        if (! $userInterestVector) {
            return 0.5; // neutral default for users with no interaction history yet
        }

        return $this->cosineSimilarity($postVector, $userInterestVector);
    }

    protected function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($a as $i => $value) {
            $dot += $value * $b[$i];
            $normA += $value ** 2;
            $normB += $b[$i] ** 2;
        }

        if ($normA == 0 || $normB == 0) {
            return 0.0;
        }

        return (($dot / (sqrt($normA) * sqrt($normB))) + 1) / 2;
    }

    protected function relationshipDepth(int $viewingUserId, int $maxWeighted, int $authorId): float
    {
        if ($maxWeighted === 0) {
            return 0.0;
        }

        $counts = Interaction::where('user_id', $viewingUserId)
            ->whereHas('post', fn ($q) => $q->where('user_id', $authorId))
            ->where('created_at', '>=', now()->subDays(90))
            ->selectRaw("
                COUNT(*) FILTER (WHERE type = 'view') as views,
                COUNT(*) FILTER (WHERE type = 'reply') as replies,
                COUNT(*) FILTER (WHERE type = 'reaction') as reactions
            ")
            ->first();

        $weighted = ($counts->views ?? 0) * 1 + ($counts->replies ?? 0) * 3 + ($counts->reactions ?? 0) * 2;

        return min($weighted / $maxWeighted, 1.0);
    }

    protected function maxWeightedInteractionForUser(User $user): int
    {
        $rows = Interaction::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(90))
            ->join('posts', 'interactions.post_id', '=', 'posts.id')
            ->selectRaw("
                posts.user_id as author_id,
                COUNT(*) FILTER (WHERE interactions.type = 'view') as views,
                COUNT(*) FILTER (WHERE interactions.type = 'reply') as replies,
                COUNT(*) FILTER (WHERE interactions.type = 'reaction') as reactions
            ")
            ->groupBy('posts.user_id')
            ->get();

        $max = 1;
        foreach ($rows as $row) {
            $weighted = $row->views * 1 + $row->replies * 3 + $row->reactions * 2;
            $max = max($max, $weighted);
        }

        return $max;
    }
}
