<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [

        'user_id',

        'text_content',

        'image_url',

        'authenticity_score'

    ];

    protected function casts(): array
    {
        return [

            'authenticity_score' => 'float',

            'created_at' => 'datetime',

            'updated_at' => 'datetime'

        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function embedding()
    {
        return $this->hasOne(PostEmbedding::class);
    }

    public function interactions()
    {
        return $this->hasMany(Interaction::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function views()
    {
        return $this->interactions()
            ->where('type', 'view');
    }

    public function reactions()
    {
        return $this->interactions()
            ->where('type', 'reaction');
    }

    public function replies()
    {
        return $this->interactions()
            ->where('type', 'reply');
    }

    public function getViewsCountAttribute()
    {
        return $this->views()->count();
    }

    public function getRepliesCountAttribute()
    {
        return $this->replies()->count();
    }

    public function getReactionsCountAttribute()
    {
        return $this->reactions()->count();
    }
}