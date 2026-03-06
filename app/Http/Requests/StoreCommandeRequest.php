<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_client' => 'nullable|exists:clients,id_client',
            'remise' => 'nullable|numeric|min:0',
            'lignes' => 'required|array|min:1',
            'lignes.*.id_variante' => 'required|exists:produit_variantes,id_variante',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
            'lignes.*.taux_tva' => 'nullable|numeric|min:0|max:100',
            'lignes.*.remise_ligne' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'lignes.required' => 'Veuillez ajouter au moins un produit à la vente.',
            'lignes.min' => 'Veuillez ajouter au moins un produit à la vente.',
            'lignes.*.id_variante.required' => 'Le produit est obligatoire pour chaque ligne.',
            'lignes.*.id_variante.exists' => 'Le produit sélectionné n\'existe pas.',
            'lignes.*.quantite.required' => 'La quantité est obligatoire.',
            'lignes.*.quantite.min' => 'La quantité doit être d\'au moins 1.',
            'lignes.*.prix_unitaire.required' => 'Le prix unitaire est obligatoire.',
            'lignes.*.prix_unitaire.min' => 'Le prix unitaire ne peut pas être négatif.',
            'id_client.exists' => 'Le client sélectionné n\'existe pas.',
        ];
    }
}
