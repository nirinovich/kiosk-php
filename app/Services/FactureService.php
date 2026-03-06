<?php

namespace App\Services;

use App\Models\Commande;
use App\Models\Facture;
use App\Models\LigneFacture;
use App\Models\ParametresEntreprise;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FactureService
{
    /**
     * Générer une facture à partir d'une commande validée.
     *
     * @param Commande $commande
     * @return Facture
     * @throws ValidationException
     */
    public function genererFacture(Commande $commande): Facture
    {
        return DB::transaction(function () use ($commande) {
            // Vérifier qu'aucune facture n'existe déjà pour cette commande
            if ($commande->facture()->exists()) {
                throw ValidationException::withMessages([
                    'id_commande' => 'Une facture a déjà été générée pour cette commande.',
                ]);
            }

            // Générer le numéro de facture séquentiel
            $dernierNumero = Facture::max('id') ?? 0;
            $numeroFacture = 'FAC-' . str_pad($dernierNumero + 1, 6, '0', STR_PAD_LEFT);

            // Récupérer les infos entreprise
            $entreprise = ParametresEntreprise::first();

            // Récupérer les infos client
            $client = $commande->client;

            // Créer la facture avec snapshots
            $facture = Facture::create([
                'numero_facture' => $numeroFacture,
                'id_commande' => $commande->id,
                'date_emission' => now()->toDateString(),
                'entreprise_nom' => $entreprise?->nom_commercial ?? '',
                'entreprise_adresse' => $entreprise?->adresse,
                'entreprise_nif' => $entreprise?->nif,
                'entreprise_stat' => $entreprise?->stat,
                'entreprise_telephone' => $entreprise?->telephone,
                'entreprise_email' => $entreprise?->email,
                'entreprise_logo_url' => $entreprise?->logo_url,
                'client_nom' => $client?->name,
                'client_adresse' => $client?->adresse,
                'client_email' => $client?->email,
                'client_telephone' => $client?->telephone,
                'client_nif' => $client?->nif,
                'montant_ht' => $commande->montant_ht,
                'montant_tva' => $commande->montant_tva,
                'montant_ttc' => $commande->montant_ttc,
                'note_pied_page' => $entreprise?->note_pied_page,
            ]);

            // Copier les lignes de commande vers les lignes de facture
            foreach ($commande->lignes as $ligne) {
                LigneFacture::create([
                    'id_facture' => $facture->id,
                    'designation' => $ligne->designation,
                    'quantite' => $ligne->quantite,
                    'prix_unitaire' => $ligne->prix_unitaire,
                    'taux_tva' => $ligne->taux_tva,
                    'sous_total' => $ligne->sous_total,
                ]);
            }

            // Mettre à jour le statut de facturation de la commande
            $commande->update(['statut_facturation' => 'facturee']);

            return $facture->load('lignes');
        });
    }
}
