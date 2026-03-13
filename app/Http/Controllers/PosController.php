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
                return $modele->variantes->map(function ($variante) use ($modele) {
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
            ->filter();
            
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
        $commande = $this->commandeService->creerCommande($request->validated());

        return redirect()->route('pos.index')->with([
            'success' => 'Vente enregistrée avec succès !',
            'commande' => [
                'id' => $commande->id,
                'numero_commande' => $commande->numero_commande,
                'montant_ht' => $commande->montant_ht,
                'montant_tva' => $commande->montant_tva,
                'montant_ttc' => $commande->montant_ttc,
                'remise' => $commande->remise,
                'created_at' => $commande->created_at->toISOString(),
                'client' => $commande->client ? [
                    'name' => $commande->client->name,
                    'telephone' => $commande->client->telephone ?? null,
                ] : null,
                'lignes' => $commande->lignes->map(fn ($l) => [
                    'designation' => $l->designation,
                    'quantite' => $l->quantite,
                    'prix_unitaire' => $l->prix_unitaire,
                    'remise_ligne' => $l->remise_ligne,
                    'sous_total' => $l->sous_total,
                    'taux_tva' => $l->taux_tva,
                ])->toArray(),
            ],
        ]);
    }

    /**
     * Diffuse le scan de code-barre aux autres appareils connectés du même utilisateur.
     */
    public function broadcastScan(Request $request): JsonResponse
    {
        $code = $request->input('code');

        if ($code) {
            broadcast(new \App\Events\BarcodeScanned(auth()->id(), $code))->toOthers();
        }

        return response()->json(['success' => true]);
    }
}
