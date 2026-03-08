<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribut;
use App\Models\ValeurAttribut;
use App\Models\ProduitModele;
use App\Models\ProduitVariante;
use App\Models\Categorie;

class CatalogueSeeder extends Seeder
{
    public function run()
    {
        // ---------------------------------------------------
        // 0. CRÉATION DES CATÉGORIES
        // ---------------------------------------------------

        $catVetements = Categorie::create(['nom' => 'Vêtements', 'description' => 'Articles textiles et habillement']);
        $catAccessoires = Categorie::create(['nom' => 'Accessoires', 'description' => 'Objets et accessoires divers']);
        $catGoodies = Categorie::create(['nom' => 'Goodies', 'description' => 'Produits dérivés et goodies']);

        // ---------------------------------------------------
        // 1. CRÉATION DES ATTRIBUTS ET VALEURS
        // ---------------------------------------------------

        $couleur = Attribut::create(['nom_attribut' => 'Couleur']);
        $valCouleurRouge = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Rouge']);
        $valCouleurBleu  = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Bleu']);
        $valCouleurNoir  = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Noir']);
        $valCouleurGris  = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Gris']);

        $taille = Attribut::create(['nom_attribut' => 'Taille']);
        $valTailleS  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'S']);
        $valTailleM  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'M']);
        $valTailleL  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'L']);
        $valTailleXL = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'XL']);

        // ---------------------------------------------------
        // 2. PRODUITS EXISTANTS (T-Shirt & Mug)
        // ---------------------------------------------------

        $tshirt = ProduitModele::create(['name' => 'T-Shirt Coton Premium', 'prix_standard' => 15.00, 'id_categorie' => $catVetements->id_categorie]);
        
        $varTsRougeM = ProduitVariante::create(['id_modele' => $tshirt->id_modele, 'reference_sku' => 'TSHIRT-RGE-M', 'stock_reel' => 10]);
        $varTsRougeM->valeurs()->attach([$valCouleurRouge->id_valeur, $valTailleM->id_valeur]);

        $varTsBleuL = ProduitVariante::create(['id_modele' => $tshirt->id_modele, 'reference_sku' => 'TSHIRT-BLU-L', 'stock_reel' => 5]);
        $varTsBleuL->valeurs()->attach([$valCouleurBleu->id_valeur, $valTailleL->id_valeur]);

        $varTsNoirXL = ProduitVariante::create(['id_modele' => $tshirt->id_modele, 'reference_sku' => 'TSHIRT-NOI-XL', 'stock_reel' => 2, 'surcout_prix' => 2.50]);
        $varTsNoirXL->valeurs()->attach([$valCouleurNoir->id_valeur, $valTailleXL->id_valeur]);

        $mug = ProduitModele::create(['name' => 'Mug ERP', 'prix_standard' => 8.00, 'id_categorie' => $catGoodies->id_categorie]);
        $varMug = ProduitVariante::create(['id_modele' => $mug->id_modele, 'reference_sku' => 'MUG-STANDARD', 'stock_reel' => 50]);

        // ---------------------------------------------------
        // 3. NOUVEAUX PRODUITS SIMPLES
        // ---------------------------------------------------

        // A. Sweat à capuche
        $sweat = ProduitModele::create(['name' => 'Sweat à capuche', 'prix_standard' => 35.00, 'id_categorie' => $catVetements->id_categorie]);
        
        $varSweatNoirM = ProduitVariante::create(['id_modele' => $sweat->id_modele, 'reference_sku' => 'SWEAT-NOI-M', 'stock_reel' => 15]);
        $varSweatNoirM->valeurs()->attach([$valCouleurNoir->id_valeur, $valTailleM->id_valeur]);
        
        $varSweatGrisL = ProduitVariante::create(['id_modele' => $sweat->id_modele, 'reference_sku' => 'SWEAT-GRI-L', 'stock_reel' => 8]);
        $varSweatGrisL->valeurs()->attach([$valCouleurGris->id_valeur, $valTailleL->id_valeur]);

        // B. Casquette Brodée
        $casquette = ProduitModele::create(['name' => 'Casquette Brodée', 'prix_standard' => 12.00, 'id_categorie' => $catAccessoires->id_categorie]);
        
        $varCasqRouge = ProduitVariante::create(['id_modele' => $casquette->id_modele, 'reference_sku' => 'CASQ-RGE', 'stock_reel' => 30]);
        $varCasqRouge->valeurs()->attach([$valCouleurRouge->id_valeur]);
        
        $varCasqNoir = ProduitVariante::create(['id_modele' => $casquette->id_modele, 'reference_sku' => 'CASQ-NOI', 'stock_reel' => 25]);
        $varCasqNoir->valeurs()->attach([$valCouleurNoir->id_valeur]);

        // C. Tapis de souris XL
        $tapis = ProduitModele::create(['name' => 'Tapis de souris XXL', 'prix_standard' => 20.00, 'id_categorie' => $catAccessoires->id_categorie]);
        $varTapis = ProduitVariante::create(['id_modele' => $tapis->id_modele, 'reference_sku' => 'TAPIS-XXL', 'stock_reel' => 40]);

        // D. Gourde Isotherme
        $gourde = ProduitModele::create(['name' => 'Gourde Isotherme 1L', 'prix_standard' => 18.00, 'id_categorie' => $catAccessoires->id_categorie]);
        $varGourdeBleu = ProduitVariante::create(['id_modele' => $gourde->id_modele, 'reference_sku' => 'GOURDE-BLU', 'stock_reel' => 12]);
        $varGourdeBleu->valeurs()->attach([$valCouleurBleu->id_valeur]);

        // ---------------------------------------------------
        // 4. CRÉATION DES PACKS (Nomenclatures)
        // ---------------------------------------------------

        // PACK 1 : Pack Développeur (Déjà vu)
        $packDev = ProduitModele::create(['name' => 'Pack Développeur', 'prix_standard' => 22.00, 'id_categorie' => $catGoodies->id_categorie]);
        $varPackDev = ProduitVariante::create(['id_modele' => $packDev->id_modele, 'reference_sku' => 'PACK-DEV', 'stock_reel' => 0, 'est_pack' => true]);
        $varPackDev->composants()->attach([
            $varTsNoirXL->id_variante => ['quantite' => 1],
            $varMug->id_variante => ['quantite' => 1],
        ]);

        // PACK 2 : Pack Télétravail (Sweat Noir M + Tapis XXL + Mug)
        $packTele = ProduitModele::create(['name' => 'Pack Télétravail Confort', 'prix_standard' => 55.00, 'id_categorie' => $catAccessoires->id_categorie]);
        $varPackTele = ProduitVariante::create(['id_modele' => $packTele->id_modele, 'reference_sku' => 'PACK-TELETRAVAIL', 'stock_reel' => 0, 'est_pack' => true]);
        $varPackTele->composants()->attach([
            $varSweatNoirM->id_variante => ['quantite' => 1], // Stock réel: 15
            $varTapis->id_variante => ['quantite' => 1],      // Stock réel: 40
            $varMug->id_variante => ['quantite' => 1],        // Stock réel: 50
        ]);
        // -> Le stock dispo de ce pack devrait être de 15 !

        // PACK 3 : Pack Été (T-Shirt Bleu L + Casquette Rouge + Gourde Bleu)
        $packEte = ProduitModele::create(['name' => 'Pack Été', 'prix_standard' => 40.00, 'id_categorie' => $catVetements->id_categorie]);
        $varPackEte = ProduitVariante::create(['id_modele' => $packEte->id_modele, 'reference_sku' => 'PACK-ETE', 'stock_reel' => 0, 'est_pack' => true]);
        $varPackEte->composants()->attach([
            $varTsBleuL->id_variante => ['quantite' => 1],    // Stock réel: 5
            $varCasqRouge->id_variante => ['quantite' => 1],  // Stock réel: 30
            $varGourdeBleu->id_variante => ['quantite' => 1], // Stock réel: 12
        ]);
        // -> Le stock dispo de ce pack devrait être de 5 !
    }
}