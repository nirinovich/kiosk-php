<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategorieController extends Controller
{
    /**
     * Liste de toutes les catégories.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $categories = Categorie::query()
            ->withCount('produits')
            ->when($search, fn($q) => $q->where('nom', 'like', "%{$search}%")
                                        ->orWhere('description', 'like', "%{$search}%"))
            ->orderBy('nom')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => ['search' => $search],
            'flash' => ['message' => session('message')],
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    /**
     * Créer une nouvelle catégorie (Inertia ou JSON inline depuis la page produit).
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

        // If the request expects JSON (inline from product form), return JSON
        if ($request->expectsJson()) {
            return response()->json([
                'id_categorie' => $categorie->id_categorie,
                'nom' => $categorie->nom,
            ], 201);
        }

        return redirect()->route('categories.index')
            ->with('message', "Catégorie « {$categorie->nom} » créée avec succès.");
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Categorie $categorie)
    {
        return Inertia::render('Categories/Edit', [
            'categorie' => $categorie,
        ]);
    }

    /**
     * Mettre à jour une catégorie.
     */
    public function update(Request $request, Categorie $categorie)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:categories,nom,' . $categorie->id_categorie . ',id_categorie',
            'description' => 'nullable|string|max:1000',
        ], [
            'nom.required' => 'Le nom de la catégorie est obligatoire.',
            'nom.unique' => 'Cette catégorie existe déjà.',
        ]);

        $categorie->update($validated);

        return redirect()->route('categories.index')
            ->with('message', "Catégorie « {$categorie->nom} » mise à jour.");
    }

    /**
     * Supprimer une catégorie.
     */
    public function destroy(Categorie $categorie)
    {
        $nom = $categorie->nom;
        $categorie->delete();

        return redirect()->route('categories.index')
            ->with('message', "Catégorie « {$nom} » supprimée.");
    }
}
