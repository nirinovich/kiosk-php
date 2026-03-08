<?php

namespace App\Services;

use App\Models\MouvementStock;
use App\Models\ProduitVariante;

class StockService
{   

    public function mouvement($varianteId, $quantite, $type, $description = null, $commandeId = null)
    {
        $variante = ProduitVariante::lockForUpdate()->findOrFail($varianteId);

        $variante->increment('stock_reel', $quantite);

        MouvementStock::create([
            'id_variante' => $varianteId,
            'quantite' => $quantite,
            'type' => $type,
            'description' => $description,
            'id_commande_origine' => $commandeId
        ]);
    }
    /**
     * Récupérer toutes les variantes avec stock.
     */
    public function getInventaire()
    {
        return ProduitVariante::with('modele')
            ->get()
            ->map(function ($v) {
                return [
                    'id_variante' => $v->id_variante,
                    'reference_sku' => $v->reference_sku,
                    'modele' => ['name' => $v->modele->name],
                    'stock_reel' => $v->stock_reel,
                ];
            });
    }

    /**
     * Récupérer l'historique des mouvements.
     */
    public function getHistorique(array $filters = [])
    {
        $query = MouvementStock::with('variante.modele')->latest();

        if (!empty($filters['id_variante'])) {
            $query->where('id_variante', $filters['id_variante']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->get()->map(function ($m) {
            return [
                'id' => $m->id,
                'type' => $m->type,
                'quantite' => $m->quantite,
                'motif' => $m->motif,
                'created_at' => $m->created_at,
                'variante' => [
                    'id_variante' => $m->variante?->id_variante,
                    'reference_sku' => $m->variante?->reference_sku,
                    'modele' => ['name' => $m->variante?->modele?->name ?? '—'],
                ],
            ];
        });
    }

    /**
     * Récupérer toutes les variantes pour modification.
     */
    public function getVariantesForModification()
    {
        return ProduitVariante::with('modele')
            ->get()
            ->map(function ($v) {
                return [
                    'id_variante' => $v->id_variante,
                    'reference_sku' => $v->reference_sku,
                    'modele' => ['name' => $v->modele->name],
                ];
            });
    }

    /**
     * Ajuster le stock d'une variante.
     */
    public function ajusterStock(int $id_variante, int $quantite,string $type, string $motif, int $commandeId = null)
    {
        $variante = ProduitVariante::findOrFail($id_variante);

        MouvementStock::create([
            'id_variante' => $variante->id_variante,
            'quantite' => $quantite,
            'type' => $type,
            'motif' => $motif,
            'id_commande_origine' => $commandeId
        ]);

        $variante->increment('stock_reel', $quantite);
    }
}