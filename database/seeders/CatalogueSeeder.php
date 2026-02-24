<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribut;
use App\Models\ValeurAttribut;
use App\Models\ProduitModele;
use App\Models\ProduitVariante;

class CatalogueSeeder extends Seeder
{
    public function run()
    {
        // ---------------------------------------------------
        // 1. CRÉATION DES ATTRIBUTS ET LEURS VALEURS
        // ---------------------------------------------------

        // Attribut : Couleur
        $couleur = Attribut::create(['nom_attribut' => 'Couleur']);
        $valCouleurRouge = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Rouge']);
        $valCouleurBleu  = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Bleu']);
        $valCouleurNoir  = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Noir']);

        // Attribut : Taille
        $taille = Attribut::create(['nom_attribut' => 'Taille']);
        $valTailleS  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'S']);
        $valTailleM  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'M']);
        $valTailleL  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'L']);
        $valTailleXL = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'XL']);

        // ---------------------------------------------------
        // 2. CRÉATION DU PRODUIT MODÈLE (Parent)
        // ---------------------------------------------------

        $tshirt = ProduitModele::create([
            'name' => 'T-Shirt Coton Premium',
            'description' => 'Un t-shirt 100% coton, très confortable.',
            'prix_standard' => 15.00,
            'image_url' =>''
        ]);

        // ---------------------------------------------------
        // 3. CRÉATION DES VARIANTES (Déclinaisons)
        // ---------------------------------------------------

        // Variante 1 : Rouge - Taille M
        $var1 = ProduitVariante::create([
            'id_modele' => $tshirt->id_modele,
            'reference_sku' => 'TSHIRT-RGE-M',
            'stock_reel' => 10,
            'surcout_prix' => 0.00, // Pas de surcoût
        ]);
        // On attache les valeurs (Rouge et M) à cette variante via la table pivot
        $var1->valeurs()->attach([$valCouleurRouge->id_valeur, $valTailleM->id_valeur]);

        // Variante 2 : Bleu - Taille L
        $var2 = ProduitVariante::create([
            'id_modele' => $tshirt->id_modele,
            'reference_sku' => 'TSHIRT-BLU-L',
            'stock_reel' => 5,
            'surcout_prix' => 0.00,
        ]);
        // On attache (Bleu et L)
        $var2->valeurs()->attach([$valCouleurBleu->id_valeur, $valTailleL->id_valeur]);

        // Variante 3 : Noir - Taille XL (Avec un surcoût de prix !)
        $var3 = ProduitVariante::create([
            'id_modele' => $tshirt->id_modele,
            'reference_sku' => 'TSHIRT-NOI-XL',
            'stock_reel' => 2,
            'surcout_prix' => 2.50, // +2.50 HT car c'est du XL
        ]);
        // On attache (Noir et XL)
        $var3->valeurs()->attach([$valCouleurNoir->id_valeur, $valTailleXL->id_valeur]);


        // --- Produit Simple (Sans variante spécifique, juste un produit unique) ---
        $mug = ProduitModele::create([
            'name' => 'Mug ERP',
            'description' => 'Tasse à café pour développeur',
            'prix_standard' => 8.00,
            'image_url' =>''
        ]);

        ProduitVariante::create([
            'id_modele' => $mug->id_modele,
            'reference_sku' => 'MUG-STANDARD',
            'stock_reel' => 50,
        ]);
        // Note: On n'attache aucune valeur d'attribut ici, car c'est un produit unique.
    }
}