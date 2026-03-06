<?php

namespace App\Services;

use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\MouvementStock;
use App\Models\ProduitVariante;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommandeService
{
    /**
     * Créer une commande complète avec lignes, décrémentation de stock et mouvements.
     *
     * @param array $data ['id_client' => ?int, 'lignes' => [...]]
     * @return Commande
     * @throws ValidationException
     */
    public function creerCommande(array $data): Commande
    {
        return DB::transaction(function () use ($data) {
            // Générer le numéro de commande
            $dernierNumero = Commande::max('id') ?? 0;
            $numeroCommande = 'CMD-' . str_pad($dernierNumero + 1, 6, '0', STR_PAD_LEFT);

            // Calculer les montants
            $montantHt = 0;
            $montantTva = 0;

            // Valider le stock et préparer les lignes
            $lignesPreparees = [];
            foreach ($data['lignes'] as $ligne) {
                $variante = ProduitVariante::with('modele')->lockForUpdate()->find($ligne['id_variante']);

                if (!$variante) {
                    throw ValidationException::withMessages([
                        'lignes' => "Le produit avec l'ID {$ligne['id_variante']} n'existe pas.",
                    ]);
                }

                if ($variante->stock_reel < $ligne['quantite']) {
                    throw ValidationException::withMessages([
                        'lignes' => "Stock insuffisant pour « {$variante->modele->name} » (disponible : {$variante->stock_reel}, demandé : {$ligne['quantite']}).",
                    ]);
                }

                $prixUnitaire = $ligne['prix_unitaire'];
                $quantite = $ligne['quantite'];
                $tauxTva = $ligne['taux_tva'] ?? 20;
                $remiseLigne = $ligne['remise_ligne'] ?? 0;
                $designation = $variante->modele->name;

                // Ajouter les infos de variante à la désignation si des valeurs existent
                if ($variante->reference_sku) {
                    $designation .= ' (' . $variante->reference_sku . ')';
                }

                $sousTotal = ($prixUnitaire * $quantite) - $remiseLigne;
                $montantLigneHt = $sousTotal;
                $montantLigneTva = $sousTotal * ($tauxTva / 100);

                $montantHt += $montantLigneHt;
                $montantTva += $montantLigneTva;

                $lignesPreparees[] = [
                    'id_variante' => $variante->id_variante,
                    'designation' => $designation,
                    'quantite' => $quantite,
                    'prix_unitaire' => $prixUnitaire,
                    'taux_tva' => $tauxTva,
                    'remise_ligne' => $remiseLigne,
                    'sous_total' => $sousTotal,
                    'variante' => $variante,
                ];
            }

            $remise = $data['remise'] ?? 0;
            $montantHt -= $remise;
            $montantTtc = $montantHt + $montantTva;

            // Créer la commande
            $commande = Commande::create([
                'numero_commande' => $numeroCommande,
                'id_client' => $data['id_client'] ?? null,
                'montant_ht' => round($montantHt, 2),
                'montant_tva' => round($montantTva, 2),
                'montant_ttc' => round($montantTtc, 2),
                'remise' => round($remise, 2),
                'statut_facturation' => 'non_facturee',
            ]);

            // Créer les lignes et décrémenter le stock
            foreach ($lignesPreparees as $ligneData) {
                LigneCommande::create([
                    'id_commande' => $commande->id,
                    'id_variante' => $ligneData['id_variante'],
                    'designation' => $ligneData['designation'],
                    'quantite' => $ligneData['quantite'],
                    'prix_unitaire' => $ligneData['prix_unitaire'],
                    'taux_tva' => $ligneData['taux_tva'],
                    'remise_ligne' => $ligneData['remise_ligne'],
                    'sous_total' => $ligneData['sous_total'],
                ]);

                // Décrémenter le stock
                $ligneData['variante']->decrement('stock_reel', $ligneData['quantite']);

                // Créer le mouvement de stock
                MouvementStock::create([
                    'id_variante' => $ligneData['id_variante'],
                    'type' => 'sortie',
                    'quantite' => $ligneData['quantite'],
                    'id_commande' => $commande->id,
                    'motif' => 'Vente ' . $numeroCommande,
                ]);
            }

            return $commande->load('lignes', 'client');
        });
    }
}
