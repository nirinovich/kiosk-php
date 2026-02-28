<?php

namespace App\Http\Controllers;

use App\Models\Attribut;
use App\Models\ProduitModele;
use App\Models\ValeurAttribut;
use App\Models\Categorie;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(){
        $produit_modele = ProduitModele::with('variantes')->get();
        return Inertia::render('Products/Index',compact('produit_modele'));
    }

    public function create(){
        $attributs = Attribut::with('valeurs')->get();
        $categories = Categorie::all();
        return Inertia::render('Products/Create', compact('attributs', 'categories'));
    }

    public function store(Request $request){
        $validated = $request ->validate([
            'name' => 'required|string|max:255',
            'prix_standard' => 'required|numeric',
            'description' => 'nullable|string',
            'variantes' => 'nullable|array',
            'id_categorie' => 'nullable|exists:categories,id_categorie',
        ]);

        DB::transaction(function() use ($validated,$request){
            $produit = ProduitModele::create([
                'name' => $validated['name'],
                'prix_standard' => $validated['prix_standard'],
                'description' => $validated['description'],
                'id_categorie' => $validated['id_categorie'],
            ]);
            if(!empty($validated['variantes'])){
                foreach($validated['variantes'] as $varianteData){
                    $nouvelleVariante = $produit->variantes()->create([
                        'reference_sku' => $varianteData['sku'] ?? null,
                        'surcout_prix' => $varianteData['surcout'] ?? 0,
                        'stock_reel' => 0,
                    ]);
                    $idsAAjouter = $varianteData['valeurs_ids'] ?? [];
                    if(!empty($varianteData['valeurs_custom'])){
                        foreach($varianteData['valeurs_custom'] as $custom){
                            // 1. Cherche l'attribut (ex:"Matière")
                            $attribut = Attribut::firstOrCreate([
                                'nom_attribut' => $custom['attribut']
                            ]);
                            // 2. Cherche la valeur (ex:"Coton")
                            $valeur = ValeurAttribut::firstOrCreate([
                                'id_attribut' => $attribut->id_attribut,
                                'nom_valeur' => $custom['valeur']
                            ]);
                            $idsAAjouter[] = $valeur->id_valeur;
                        }
                    }
                }if(!empty($idsAAjouter)){
                    $nouvelleVariante->valeurs()->attach($idsAAjouter);
                }
            }
        });
        
        return redirect()->route('products.index')->with('message','Product created');
    }

    public function edit($id)
    {
        $produit_modele = ProduitModele::with(['variantes.valeurs'])->findOrFail($id);
        $attributs = Attribut::with('valeurs')->get();
        $categories = Categorie::all();

        return Inertia::render('Products/Edit', [
            'produit_modele' => $produit_modele,
            'attributs' => $attributs,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, ProduitModele $produit_modele)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'prix_standard' => 'required|numeric',
            'description' => 'nullable|string',
            'id_categorie' => 'nullable|exists:categories,id_categorie',
            
            'variantes' => 'array',
            'variantes.*.id_variante' => 'nullable|integer', 
            'variantes.*.sku' => 'nullable|string|max:255',
            'variantes.*.surcout' => 'nullable|numeric',
            'variantes.*.valeurs_ids' => 'array',
        ]);

        DB::transaction(function () use ($request, $produit_modele) {
            $produit_modele->update([
                'name' => $request->input('name'),
                'prix_standard' => $request->input('prix_standard'),
                'description' => $request->input('description'),
                'id_categorie' => $request->input('id_categorie'),
            ]);

            $variantesRecues = $request->input('variantes', []);
            $idsVariantesAGarder = collect($variantesRecues)
                ->pluck('id_variante')
                ->filter() // Retire les valeurs nulles (les nouvelles variantes pas encore créées)
                ->toArray();

            // On supprime de la BDD les variantes qui ne sont plus présentes dans le formulaire
            $produit_modele->variantes()->whereNotIn('id_variante', $idsVariantesAGarder)->delete();

            foreach ($variantesRecues as $varianteData) {
                if (!empty($varianteData['id_variante'])) {
                    $variante = $produit_modele->variantes()->find($varianteData['id_variante']);
                    if ($variante) {
                        $variante->update([
                            'reference_sku' => $varianteData['sku'],
                            'surcout_prix' => $varianteData['surcout'] ?? 0,
                        ]);
                    }
                } else {
                    $variante = $produit_modele->variantes()->create([
                        'reference_sku' => $varianteData['sku'],
                        'surcout_prix' => $varianteData['surcout'] ?? 0,
                    ]);
                }

                if (isset($variante) && isset($varianteData['valeurs_ids'])) {
                    $variante->valeurs()->sync($varianteData['valeurs_ids']);
                }
            }
        });

        return redirect()->route('products.index')->with('message', 'Product updated successfully');
    }

    public function destroy(ProduitModele $produit_modele){
        $produit_modele->delete();
        return redirect()->route('products.index')->with('message','Product destoyed');

    }
}
