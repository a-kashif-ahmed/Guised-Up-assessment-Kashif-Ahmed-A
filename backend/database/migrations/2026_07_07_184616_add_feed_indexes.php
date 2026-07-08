<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_posts_created
            ON posts(created_at DESC);
        ");

        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_interactions_lookup
            ON interactions(user_id, post_id, type);
        ");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS idx_posts_created;");
        DB::statement("DROP INDEX IF EXISTS idx_interactions_lookup;");
    }
};