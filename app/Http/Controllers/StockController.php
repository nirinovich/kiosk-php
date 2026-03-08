<?php

namespace App\Http\Controllers;

use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Affiche la page principale avec l'inventaire (Index.tsx)
     */
    public function index()
    {
        $variantes = $this->stockService->getInventaire();

        return Inertia::render('Stock/Index', [
            'variantes' => $variantes,
        ]);
    }

    /**
     * Affiche l'historique des mouvements de stock (Historique.tsx)
     */
    public function historique(Request $request)
    {
        $filters = $request->only(['id_variante', 'type']);
        $mouvements = $this->stockService->getHistorique($filters);

        return Inertia::render('Stock/Historique', [
            'mouvements' => $mouvements,
        ]);
    }

    /**
     * Affiche le formulaire pour modifier le stock (Modification.tsx)
     */
    public function modification()
    {
        $variantes = $this->stockService->getVariantesForModification();

        return Inertia::render('Stock/Modification', [
            'variantes' => $variantes,
        ]);
    }

    /**
     * Traite l'ajustement du stock (formulaire Modification.tsx)
     */
    public function ajustement(Request $request)
    {
        $request->validate([
            'id_variante' => 'required|exists:produit_variantes,id_variante',
            'quantite' => 'required|integer',
            'motif' => 'required|string|max:255',
            'type' => 'required|string|in:achat,vente,inventaire,retour,perte',
        ]);

        $this->stockService->ajusterStock(
            $request->id_variante,
            $request->quantite,
            $request->type,
            $request->motif
        );

        return redirect()->back()->with('success', 'Stock ajusté avec succès.');
    }
}