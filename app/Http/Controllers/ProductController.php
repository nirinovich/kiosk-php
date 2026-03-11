<?php

namespace App\Http\Controllers;

use App\Models\Attribut;
use App\Models\ProduitModele;
use App\Models\ValeurAttribut;
use App\Models\Categorie;
use App\Models\ProduitVariante;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $produit_modele = ProduitModele::query()
            ->with(['categorie', 'variantes.composants']) 
            ->withCount('variantes')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('categorie', function ($cq) use ($search) {
                          $cq->where('nom', 'like', "%{$search}%");
                      });
                });
            })
            ->get()
            ->map(function ($modele) {
                $modele->variantes_sum_stock_reel = $modele->variantes->sum(function ($variante) {
                    return $variante->stock_disponible ?? $variante->stock_reel; 
                });
                return $modele;
            });

        return Inertia::render('Products/Index', [
            'produit_modele' => $produit_modele,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    private function getAvailableVariantes() {
        return ProduitVariante::with('modele:id_modele,name')
            ->where('est_pack', false) 
            ->get()
            ->map(function ($v) {
                $name = $v->modele ? $v->modele->name : 'Produit';
                $sku = $v->reference_sku ? " - {$v->reference_sku}" : " (Simple)";
                return [
                    'id_variante' => $v->id_variante,
                    'sku' => $name . $sku
                ];
            });
    }

    public function create(){
        $attributs = Attribut::with('valeurs')->get();
        $categories = Categorie::all();
        $availableVariantes = $this->getAvailableVariantes();
        return Inertia::render('Products/Create', compact('attributs', 'categories', 'availableVariantes'));
    }

    public function quickCreateIngredient(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'prix_standard' => 'nullable|numeric|min:0',
            'id_categorie' => 'nullable|exists:categories,id_categorie',
            'stock_reel' => 'nullable|numeric|min:0',
        ]);
        
        DB::beginTransaction();
        try {
            $produit = ProduitModele::create([
                'name' => $request->name,
                'prix_standard' => $request->prix_standard ?? 0,
                'id_categorie' => $request->id_categorie ?: null,
            ]);
            
            $stock = $request->stock_reel ?? 0;
            $variante = $produit->variantes()->create([
                'stock_reel' => $stock,
                'est_pack' => false,
            ]);
            DB::commit();
            
            return response()->json([
                'id_variante' => $variante->id_variante,
                'sku' => $produit->name . ' (Simple)'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request){
        $validated = $request ->validate([
            'name' => 'required|string|max:255',
            'prix_standard' => 'required|numeric',
            'description' => 'nullable|string',
            'stock_initial' => 'nullable|integer|min:0',
            'image_url' => 'nullable|image',
            'variantes' => 'nullable|array',
            'variantes.*.stock_reel' => 'nullable|integer|min:0',
            'id_categorie' => 'nullable|exists:categories,id_categorie',

            'variantes.*.est_pack' => 'nullable|boolean',
            'variantes.*.composants' => 'nullable|array',
            'variantes.*.composants.*.id_variante' => 'required_with:variantes.*.composants|integer|exists:produit_variantes,id_variante',
            'variantes.*.composants.*.quantite' => 'required_with:variantes.*.composants|numeric|gt:0',
        ]);

        $imagePath = null;
        if ($request->hasFile('image_url')) {
            $image = $request->file('image_url');
            $imageName = time().'_'.$image->getClientOriginalName();

            $image->move(public_path('images'), $imageName);

            $imagePath = 'images/'.$imageName;
        }

        DB::transaction(function() use ($validated,$request,$imagePath){
            $produit = ProduitModele::create([
                'name' => $validated['name'],
                'prix_standard' => $validated['prix_standard'],
                'description' => $validated['description'],
                'image_url' => $imagePath,
                'id_categorie' => $validated['id_categorie'],
            ]);
            if(empty($validated['variantes'])){
                // Pas de variantes explicites : on crée une variante par défaut pour gérer le stock
                $produit->variantes()->create([
                    'reference_sku' => null,
                    'surcout_prix' => 0,
                    'stock_reel' => $validated['stock_initial'] ?? 0,
                    'est_pack' => false,
                ]);
            } else {
                foreach($validated['variantes'] as $varianteData){
                    $estPack = !empty($varianteData['est_pack']);

                    $nouvelleVariante = $produit->variantes()->create([
                        'reference_sku' => $varianteData['sku'] ?? null,
                        'surcout_prix' => $varianteData['surcout'] ?? 0,
                        'stock_reel' => $estPack ? 0 : ($varianteData['stock_reel'] ?? 0),
                        'est_pack' => $estPack,
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
                    if(!empty($idsAAjouter)){
                        $nouvelleVariante->valeurs()->attach($idsAAjouter);
                    }
                    if ($estPack && !empty($varianteData['composants'])) {
                        $composantsSync = [];
                        
                        // On prépare le tableau pour la table pivot (ex: composant_id => ['quantite' => X])
                        foreach ($varianteData['composants'] as $composant) {
                            $composantsSync[$composant['id_variante']] = [
                                'quantite' => $composant['quantite']
                            ];
                        }
                        
                        // On attache les composants à notre nouvelle variante "pack"
                        $nouvelleVariante->composants()->sync($composantsSync);
                    }
                }
            }
        });
        
        return redirect()->route('products.index')->with('message', 'Produit créé avec succès');
    }

    public function edit($id)
    {
        $produit_modele = ProduitModele::with(['variantes.valeurs', 'variantes.composants'])->findOrFail($id);
        $attributs = Attribut::with('valeurs')->get();
        $categories = Categorie::all();

        // Detect if product is "simple" (1 variant with no attribute values, not a pack)
        $isSimpleProduct = $produit_modele->variantes->count() === 1
            && $produit_modele->variantes->first()->valeurs->isEmpty()
            && !$produit_modele->variantes->first()->est_pack;

        $currentStock = $isSimpleProduct
            ? (int) $produit_modele->variantes->first()->stock_reel
            : 0;

        $availableVariantes = $this->getAvailableVariantes();

        return Inertia::render('Products/Edit', [
            'produit_modele' => $produit_modele,
            'attributs' => $attributs,
            'image_url' => $produit_modele->image_url,
            'categories' => $categories,
            'isSimpleProduct' => $isSimpleProduct,
            'currentStock' => $currentStock,
            'availableVariantes' => $availableVariantes,
        ]);
    }

    public function update(Request $request, ProduitModele $produit_modele)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'prix_standard' => 'required|numeric',
            'description' => 'nullable|string',
            'image_url' => 'nullable|image',
            'remove_image' => 'nullable|boolean',
            'id_categorie' => 'nullable|exists:categories,id_categorie',
            'is_simple' => 'boolean',
            'stock_initial' => 'nullable|integer|min:0',

            'variantes' => 'nullable|array',
            'variantes.*.id_variante' => 'nullable|integer',
            'variantes.*.sku' => 'nullable|string|max:255',
            'variantes.*.surcout' => 'nullable|numeric',
            'variantes.*.stock_reel' => 'nullable|integer|min:0',
            'variantes.*.valeurs_ids' => 'nullable|array',
            'variantes.*.valeurs_custom' => 'nullable|array',
            'variantes.*.est_pack' => 'nullable|boolean',
            'variantes.*.composants' => 'nullable|array',
            'variantes.*.composants.*.id_variante' => 'required_with:variantes.*.composants|integer|exists:produit_variantes,id_variante',
            'variantes.*.composants.*.quantite' => 'required_with:variantes.*.composants|numeric|gt:0',
        ]);

        DB::transaction(function () use ($request, $produit_modele) {
            // Handle image upload
            $imageUrl = $produit_modele->image_url;
            $removeImage = $request->boolean('remove_image', false);

            if ($removeImage && $imageUrl) {
                $existingImagePath = public_path($imageUrl);

                if (File::exists($existingImagePath)) {
                    File::delete($existingImagePath);
                }

                $imageUrl = null;
            }

            if ($request->hasFile('image_url')) {
                if ($imageUrl) {
                    $existingImagePath = public_path($imageUrl);

                    if (File::exists($existingImagePath)) {
                        File::delete($existingImagePath);
                    }
                }

                $image = $request->file('image_url');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('images'), $imageName);
                $imageUrl = 'images/' . $imageName;
            }

            $produit_modele->update([
                'name' => $request->input('name'),
                'prix_standard' => $request->input('prix_standard'),
                'description' => $request->input('description'),
                'image_url' => $imageUrl,
                'id_categorie' => $request->input('id_categorie'),
            ]);

            $isSimple = $request->boolean('is_simple', false);

            if ($isSimple) {
                // Simple product mode: upsert a single default variant
                $defaultVariant = $produit_modele->variantes()->first();
                $stock = $request->input('stock_initial', 0);

                if ($defaultVariant) {
                    // Delete any extra variants, keep only the first
                    $produit_modele->variantes()->where('id_variante', '!=', $defaultVariant->id_variante)->delete();
                    $defaultVariant->update([
                        'reference_sku' => null,
                        'surcout_prix' => 0,
                        'stock_reel' => $stock,
                        'est_pack' => false,
                    ]);
                    $defaultVariant->valeurs()->detach();
                    $defaultVariant->composants()->detach();
                } else {
                    $produit_modele->variantes()->create([
                        'reference_sku' => null,
                        'surcout_prix' => 0,
                        'stock_reel' => $stock,
                        'est_pack' => false,
                    ]);
                }
            } else {
                // Variant mode
                $variantesRecues = $request->input('variantes', []);
                $idsVariantesAGarder = collect($variantesRecues)
                    ->pluck('id_variante')
                    ->filter()
                    ->toArray();

                $produit_modele->variantes()->whereNotIn('id_variante', $idsVariantesAGarder)->delete();

                foreach ($variantesRecues as $varianteData) {
                    $estPack = !empty($varianteData['est_pack']) && $varianteData['est_pack'] == true;

                    if (!empty($varianteData['id_variante'])) {
                        $variante = $produit_modele->variantes()->find($varianteData['id_variante']);
                        if ($variante) {
                            $variante->update([
                                'reference_sku' => $varianteData['sku'] ?? null,
                                'surcout_prix' => $varianteData['surcout'] ?? 0,
                                'stock_reel' => $estPack ? 0 : ($varianteData['stock_reel'] ?? $variante->stock_reel),
                                'est_pack' => $estPack,
                            ]);
                        }
                    } else {
                        $variante = $produit_modele->variantes()->create([
                            'reference_sku' => $varianteData['sku'] ?? null,
                            'surcout_prix' => $varianteData['surcout'] ?? 0,
                            'stock_reel' => $estPack ? 0 : ($varianteData['stock_reel'] ?? 0),
                            'est_pack' => $estPack,
                        ]);
                    }

                    // Handle attribute values
                    if (isset($variante)) {
                        $idsAAjouter = $varianteData['valeurs_ids'] ?? [];

                        if (!empty($varianteData['valeurs_custom'])) {
                            foreach ($varianteData['valeurs_custom'] as $custom) {
                                $attribut = Attribut::firstOrCreate(['nom_attribut' => $custom['attribut']]);
                                $valeur = ValeurAttribut::firstOrCreate([
                                    'id_attribut' => $attribut->id_attribut,
                                    'nom_valeur' => $custom['valeur'],
                                ]);
                                $idsAAjouter[] = $valeur->id_valeur;
                            }
                        }

                        $variante->valeurs()->sync($idsAAjouter);

                        // Attach pack components
                        if ($estPack && !empty($varianteData['composants'])) {
                            $composantsSync = [];
                            foreach ($varianteData['composants'] as $composant) {
                                if (!empty($composant['id_variante'])) {
                                    $composantsSync[$composant['id_variante']] = [
                                        'quantite' => $composant['quantite'] ?? 1
                                    ];
                                }
                            }
                            $variante->composants()->sync($composantsSync);
                        } else {
                            $variante->composants()->sync([]);
                        }
                    }
                }
            }
        });

        return redirect()->route('products.index')->with('message', 'Produit mis à jour avec succès');
    }

    public function destroy(ProduitModele $produit_modele){
        $produit_modele->delete();
        return redirect()->route('products.index')->with('message', 'Produit supprimé');

    }
}
