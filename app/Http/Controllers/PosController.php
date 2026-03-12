<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\ProduitModele;
use App\Services\CommandeService;
use Inertia\Inertia;

class PosController extends Controller
{
    public function __construct(
        protected CommandeService $commandeService
    ) {}

    /**
     * Affiche l'interface POS.
     */
    public function index()
    {
        $produits = ProduitModele::with(['variantes.composants', 'categorie'])
            ->where('is_ingredient', false)
            ->get()
            ->map(function ($modele) {
                $variantesEnStock = $modele->variantes->filter(function ($v) {
                    return $v->stock_disponible > 0; 
                });
                if ($variantesEnStock->isEmpty()) return null;

                return $variantesEnStock->map(function ($variante) use ($modele) {
                    $suffix = '';
                    if ($modele->variantes->count() > 1 && $variante->reference_sku) {
                        $suffix = ' (' . $variante->reference_sku . ')';
                    }
                    return [
                        'id_variante' => $variante->id_variante,
                        'nom' => $modele->name . $suffix,
                        'prix' => $modele->prix_standard + $variante->surcout_prix,
                        'stock' => $variante->stock_disponible, 
                        'est_pack' => $variante->est_pack,
                        
                        'image_url' => $modele->image_url,
                        'id_categorie' => $modele->id_categorie,
                    ];
                });
            })
            ->flatten(1)
            ->filter(); // Enlève les nulls

        $categories = Categorie::orderBy('nom')->get(['id_categorie', 'nom']);
        $clients = Client::orderBy('name')->get(['id_client', 'name']);

        return Inertia::render('Pos/Index', [
            'produits' => $produits->values(),
            'categories' => $categories,
            'clients' => $clients,
        ]);
    }

    /**
     * Enregistrer une vente depuis le POS.
     */
    public function store(StoreCommandeRequest $request)
    {
        $this->commandeService->creerCommande($request->validated());

        return redirect()->route('pos.index')->with('success', 'Vente enregistrée avec succès !');
    }
}
