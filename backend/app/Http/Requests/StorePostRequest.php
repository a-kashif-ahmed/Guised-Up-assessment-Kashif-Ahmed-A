<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    /**
     * Only authenticated users can create posts.
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

            'text_content' => [
                'required',
                'string',
                'max:5000'
            ],

            'image_url' => [
                'nullable',
                'url',
                'max:2048'
            ],

        ];
    }

    /**
     * Optional preprocessing.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'text_content' => trim($this->text_content ?? '')
        ]);
    }

    public function messages(): array
    {
        return [

            'text_content.required' => 'Post text is required.',

            'image_url.url' => 'Image URL is invalid.'

        ];
    }
}