<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\ProduitModele;
use App\Models\ProduitVariante;
use App\Services\CommandeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
                        'code_barre' => $variante->code_barre,
                        
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
     * Recherche un produit par code-barres (API JSON).
     */
    public function barcodeLookup(Request $request): JsonResponse
    {
        $code = $request->input('code');

        if (!$code) {
            return response()->json(['found' => false, 'message' => 'Code-barres manquant.'], 422);
        }

        $variante = ProduitVariante::with(['modele'])
            ->where('code_barre', $code)
            ->first();

        if (!$variante || !$variante->modele || $variante->modele->is_ingredient) {
            return response()->json([
                'found' => false,
                'code' => $code,
                'message' => 'Aucun produit trouvé pour ce code-barres.',
            ]);
        }

        $modele = $variante->modele;
        $suffix = '';
        if ($modele->variantes()->count() > 1 && $variante->reference_sku) {
            $suffix = ' (' . $variante->reference_sku . ')';
        }

        return response()->json([
            'found' => true,
            'produit' => [
                'id_variante' => $variante->id_variante,
                'nom' => $modele->name . $suffix,
                'prix' => $modele->prix_standard + $variante->surcout_prix,
                'stock' => $variante->stock_disponible,
                'est_pack' => $variante->est_pack,
                'code_barre' => $variante->code_barre,
                'image_url' => $modele->image_url,
                'id_categorie' => $modele->id_categorie,
            ],
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
