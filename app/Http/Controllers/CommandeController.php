<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Models\Client;
use App\Models\Commande;
use App\Models\ProduitVariante;
use App\Services\CommandeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommandeController extends Controller
{
    public function __construct(
        protected CommandeService $commandeService
    ) {}

    /**
     * Journal des ventes — liste paginée avec filtres.
     */
    public function index(Request $request)
    {
        $query = Commande::with('client')
            ->withCount('lignes')
            ->orderByDesc('created_at');

        // Filtre recherche : numéro de commande ou nom client
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('numero_commande', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filtre par plage de dates
        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $commandes = $query->paginate(15)->withQueryString();

        return Inertia::render('Ventes/Index', [
            'commandes' => $commandes,
            'filters' => [
                'search' => $request->get('search', ''),
                'date_from' => $request->get('date_from', ''),
                'date_to' => $request->get('date_to', ''),
            ],
        ]);
    }

    /**
     * Formulaire de création d'une nouvelle vente.
     */
    public function create()
    {
        $variantes = ProduitVariante::with('modele')
            ->where('stock_reel', '>', 0)
            ->get()
            ->map(function ($variante) {
                return [
                    'id_variante' => $variante->id_variante,
                    'designation' => $variante->modele->name . ($variante->reference_sku ? ' (' . $variante->reference_sku . ')' : ''),
                    'reference_sku' => $variante->reference_sku,
                    'code_barre' => $variante->code_barre,
                    'stock_reel' => $variante->stock_reel,
                    'prix_unitaire' => $variante->modele->prix_standard + $variante->surcout_prix,
                ];
            });

        $clients = Client::orderBy('name')->get(['id_client', 'name', 'email', 'telephone']);

        return Inertia::render('Ventes/Create', [
            'variantes' => $variantes,
            'clients' => $clients,
        ]);
    }

    /**
     * Enregistrer une nouvelle vente.
     */
    public function store(StoreCommandeRequest $request)
    {
        $commande = $this->commandeService->creerCommande($request->validated());

        return redirect()->route('ventes.index')->with('success', 'Vente enregistrée avec succès.');
    }

    /**
     * Détail d'une vente.
     */
    public function show(Commande $commande)
    {
        $commande->load('lignes', 'client', 'facture');

        return Inertia::render('Ventes/Show', [
            'commande' => $commande,
        ]);
    }
}
