<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInteractionRequest extends FormRequest
{
    /**
     * Only authenticated users.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Validation rules.
     */
    public function rules(): array
    {
        return [

            'post_id' => [
                'required',
                'integer',
                'exists:posts,id'
            ],

            'type' => [

                'required',

                Rule::in([
                    'view',
                    'reply',
                    'reaction'
                ])

            ]

        ];
    }

    public function messages(): array
    {
        return [

            'post_id.exists' => 'Selected post does not exist.',

            'type.in' => 'Interaction type must be view, reply or reaction.'

        ];
    }
}