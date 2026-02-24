<?php

namespace App\Http\Controllers;

use App\Models\Attribut;
use App\Models\ProduitModele;
use App\Models\ValeurAttribut;
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
        return Inertia::render('Products/Create', compact('attributs'));
    }

    public function store(Request $request){
        $validated = $request ->validate([
            'name' => 'required|string|max:255',
            'prix_standard' => 'required|numeric',
            'description' => 'nullable|string',
            'variantes' => 'nullable|array',
        ]);

        DB::transaction(function() use ($validated,$request){
            $produit = ProduitModele::create([
                'name' => $validated['name'],
                'prix_standard' => $validated['prix_standard'],
                'description' => $validated['description'],
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
                                'nom_attribut' => $custom['nom_attribut']
                            ]);
                            // 2. Cherche la valeur (ex:"Coton")
                            $valeur = ValeurAttribut::firstOrCreate([
                                'id_attribut' => $attribut->id_attribut,
                                'nom_valeur' => $custom['nom_valeur']
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

    public function edit(ProduitModele $produit_modele){
        return Inertia::render('Products/Edit', compact('produit_modele'));
    }

    public function update(Request $request, ProduitModele $produit_modele){
        $request ->validate([
            'name' => 'required|string|max:255',
            'prix_standard' => 'required|numeric',
            'description' => 'nullable|string',
        ]);
        $produit_modele->update([
            'name' => $request->input('name'),
            'prix_standard' => $request->input('prix_standard'),
            'description' => $request->input('description'),
        ]);

        return redirect()->route('products.index')->with('message','Product updated');
    }

    public function destroy(ProduitModele $produit_modele){
        $produit_modele->delete();
        return redirect()->route('products.index')->with('message','Product destoyed');

    }
}
