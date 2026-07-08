<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostEmbedding extends Model
{
    protected $table = 'post_embeddings';
    public $timestamps = false;
    protected $primaryKey = 'post_id';
    public $incrementing = false;
    protected $fillable = ['post_id', 'embedding'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Insert or replace a post's embedding using pgvector's native type.
     * Eloquent has no vector cast, so this goes through raw SQL.
     */
    public static function upsertVector(int $postId, array $vector): void
    {
        $vectorLiteral = '[' . implode(',', $vector) . ']';

        \DB::statement('
            INSERT INTO post_embeddings (post_id, embedding)
            VALUES (?, ?::vector)
            ON CONFLICT (post_id) DO UPDATE SET embedding = EXCLUDED.embedding
        ', [$postId, $vectorLiteral]);
    }
}
