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

        $catVetements = Categorie::create([
            'nom' => 'Vêtements',
            'description' => 'Articles textiles et habillement'
        ]);

        $catAccessoires = Categorie::create([
            'nom' => 'Accessoires',
            'description' => 'Objets et accessoires divers'
        ]);

        $catGoodies = Categorie::create([
            'nom' => 'Goodies',
            'description' => 'Produits dérivés et goodies'
        ]);

        // ---------------------------------------------------
        // 1. CRÉATION DES ATTRIBUTS ET VALEURS
        // ---------------------------------------------------

        $couleur = Attribut::create(['nom_attribut' => 'Couleur']);
        $valCouleurRouge = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Rouge']);
        $valCouleurBleu  = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Bleu']);
        $valCouleurNoir  = ValeurAttribut::create(['id_attribut' => $couleur->id_attribut, 'nom_valeur' => 'Noir']);

        $taille = Attribut::create(['nom_attribut' => 'Taille']);
        $valTailleS  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'S']);
        $valTailleM  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'M']);
        $valTailleL  = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'L']);
        $valTailleXL = ValeurAttribut::create(['id_attribut' => $taille->id_attribut, 'nom_valeur' => 'XL']);

        // ---------------------------------------------------
        // 2. PRODUIT MODÈLE : T-SHIRT
        // ---------------------------------------------------

        $tshirt = ProduitModele::create([
            'name' => 'T-Shirt Coton Premium',
            'description' => 'Un t-shirt 100% coton, très confortable.',
            'prix_standard' => 15.00,
            'id_categorie' => $catVetements->id_categorie, // ✅ LIÉ À VÊTEMENTS
        ]);

        $var1 = ProduitVariante::create([
            'id_modele' => $tshirt->id_modele,
            'reference_sku' => 'TSHIRT-RGE-M',
            'stock_reel' => 10,
            'surcout_prix' => 0.00,
        ]);
        $var1->valeurs()->attach([$valCouleurRouge->id_valeur, $valTailleM->id_valeur]);

        $var2 = ProduitVariante::create([
            'id_modele' => $tshirt->id_modele,
            'reference_sku' => 'TSHIRT-BLU-L',
            'stock_reel' => 5,
            'surcout_prix' => 0.00,
        ]);
        $var2->valeurs()->attach([$valCouleurBleu->id_valeur, $valTailleL->id_valeur]);

        $var3 = ProduitVariante::create([
            'id_modele' => $tshirt->id_modele,
            'reference_sku' => 'TSHIRT-NOI-XL',
            'stock_reel' => 2,
            'surcout_prix' => 2.50,
        ]);
        $var3->valeurs()->attach([$valCouleurNoir->id_valeur, $valTailleXL->id_valeur]);

        // ---------------------------------------------------
        // 3. PRODUIT SIMPLE : MUG
        // ---------------------------------------------------

        $mug = ProduitModele::create([
            'name' => 'Mug ERP',
            'description' => 'Tasse à café pour développeur',
            'prix_standard' => 8.00,
            'id_categorie' => $catGoodies->id_categorie, // ✅ LIÉ À GOODIES
        ]);

        ProduitVariante::create([
            'id_modele' => $mug->id_modele,
            'reference_sku' => 'MUG-STANDARD',
            'stock_reel' => 50,
        ]);
    }
}