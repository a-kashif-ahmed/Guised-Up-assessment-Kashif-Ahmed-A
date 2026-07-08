<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_embeddings', function (Blueprint $table) {

            $table->foreignId('post_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();

            // JSON instead of pgvector
            $table->json('embedding');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_embeddings');
    }
};