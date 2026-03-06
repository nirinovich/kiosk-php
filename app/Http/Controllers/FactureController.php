<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Facture;
use App\Services\FactureService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FactureController extends Controller
{
    public function __construct(
        protected FactureService $factureService
    ) {}

    /**
     * Générer une facture pour une commande.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_commande' => 'required|exists:commandes,id',
        ]);

        $commande = Commande::with('lignes', 'client')->findOrFail($request->id_commande);

        $facture = $this->factureService->genererFacture($commande);

        return redirect("/factures/{$facture->id}")->with('success', 'Facture générée avec succès.');
    }

    /**
     * Afficher une facture (vue imprimable).
     */
    public function show(Facture $facture)
    {
        $facture->load('lignes', 'commande');

        return Inertia::render('Factures/Show', [
            'facture' => $facture,
        ]);
    }
}
