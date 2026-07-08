<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostEmbedding extends Model
{
    use HasFactory;

    protected $table = 'post_embeddings';

    public $timestamps = false;

    protected $primaryKey = 'post_id';

    public $incrementing = false;

    protected $fillable = [

        'post_id',

        'embedding'

    ];

    protected function casts(): array
    {
        return [

            'embedding' => 'string'

        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getVectorAttribute(): array
    {
        return json_decode(
            $this->embedding,
            true
        ) ?? [];
    }

    public function setVectorAttribute(array $vector): void
    {
        $this->attributes['embedding'] = json_encode($vector);
    }
}