<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');

        DB::statement('
            CREATE TABLE post_embeddings (
                post_id BIGINT PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
                embedding vector(384) NOT NULL
            )
        ');

        DB::statement('
            CREATE INDEX idx_embeddings_vector
            ON post_embeddings
            USING ivfflat (embedding vector_cosine_ops)
        ');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS post_embeddings');
    }
};
