<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    /**
     * Créer une nouvelle catégorie (inline depuis la page produit).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:categories,nom',
            'description' => 'nullable|string|max:1000',
        ], [
            'nom.required' => 'Le nom de la catégorie est obligatoire.',
            'nom.unique' => 'Cette catégorie existe déjà.',
        ]);

        $categorie = Categorie::create($validated);

        return response()->json([
            'id_categorie' => $categorie->id_categorie,
            'nom' => $categorie->nom,
        ], 201);
    }
}
