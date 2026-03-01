<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EnterpriseUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom_commercial'  => ['required', 'string', 'max:255'],
            'raison_sociale'  => ['nullable', 'string', 'max:255'],
            'nif'             => ['nullable', 'string', 'max:50'],
            'stat'            => ['nullable', 'string', 'max:50'],
            'capital_social'  => ['nullable', 'string', 'max:50'],
            'rcs_ville'       => ['nullable', 'string', 'max:100'],
            'adresse'         => ['nullable', 'string', 'max:1000'],
            'email'           => ['required', 'string', 'email', 'max:255'],
            'telephone'       => ['nullable', 'string', 'max:20'],
            'site_web'        => ['nullable', 'url', 'max:255'],
            'logo_url'        => ['nullable', 'url', 'max:255'],
            'iban'            => ['nullable', 'string', 'max:50'],
            'bic'             => ['nullable', 'string', 'max:20'],
            'note_pied_page'  => ['nullable', 'string', 'max:2000'],
        ];
    }
}
