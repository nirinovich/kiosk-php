<?php

namespace App\Services;

use App\Models\MouvementStock;
use App\Models\ProduitVariante;

class StockService
{   
    public function mouvement($varianteId, $quantite, $type, $description = null, $commandeId = null)
    {
        $variante = ProduitVariante::with('modele')->lockForUpdate()->findOrFail($varianteId);

        if (strcasecmp($variante->modele->unite_mesure ?? '', 'unité') === 0) {
            $quantite = round($quantite);
        }

        if ($variante->est_pack) {
            foreach ($variante->composants as $composant) {
                // Also preload modele for component if needed, or query it
                $composant->loadMissing('modele');
                
                $quantite_composant = $composant->pivot->quantite * $quantite;
                if (strcasecmp($composant->modele->unite_mesure ?? '', 'unité') === 0) {
                    $quantite_composant = round($quantite_composant);
                }

                $composant->increment('stock_reel', $quantite_composant);

                MouvementStock::create([
                    'id_variante' => $composant->id_variante,
                    'quantite' => $quantite_composant,
                    'type' => $type,
                    'motif' => $description . " (Via Pack : " . $variante->reference_sku . ")",
                    'id_commande' => $commandeId
                ]);
            }
        } else {
            $variante->increment('stock_reel', $quantite);

            MouvementStock::create([
                'id_variante' => $varianteId,
                'quantite' => $quantite,
                'type' => $type,
                'motif' => $description,
                'id_commande' => $commandeId
            ]);
        }
    }

    /**
     * Récupérer toutes les variantes avec stock.
     */
    public function getInventaire()
    {
        return ProduitVariante::with(['modele','composants'])
            ->get()
            ->map(function ($v) {
                return [
                    'id_variante' => $v->id_variante,
                    'reference_sku' => $v->reference_sku,
                    'modele' => [
                        'name' => $v->modele->name,
                        'image_url' => $v->modele->image_url,
                        'unite_mesure' => $v->modele->unite_mesure,
                    ],
                    'stock_reel' => $v->stock_reel,
                    'est_pack' => $v->est_pack, 
                    'stock_disponible' => $v->stock_disponible,
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
    public function ajusterStock(int $id_variante, float $quantite, string $type, string $motif, int $commandeId = null)
    {
        $variante = ProduitVariante::with('modele')->findOrFail($id_variante);

        if (strcasecmp($variante->modele->unite_mesure ?? '', 'unité') === 0) {
            $quantite = round($quantite);
        }

        MouvementStock::create([
            'id_variante' => $variante->id_variante,
            'quantite' => $quantite,
            'type' => $type,
            'motif' => $motif,
            'id_commande' => $commandeId
        ]);

        $variante->increment('stock_reel', $quantite);
    }
}