<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProduitModele;
use App\Models\ProduitVariante;
use App\Models\Categorie;

class CatalogueSeeder extends Seeder
{
    public function run()
    {
        // ---------------------------------------------------
        // 0. CRÉATION DES CATÉGORIES (Restaurant)
        // ---------------------------------------------------

        $catPlats = Categorie::create(['nom' => 'Plats', 'description' => 'Plats principaux']);
        $catBoissons = Categorie::create(['nom' => 'Boissons', 'description' => 'Boissons fraîches et chaudes']);
        $catIngredients = Categorie::create(['nom' => 'Ingrédients', 'description' => 'Ingrédients de cuisine (Stock)']);
        $catMenus = Categorie::create(['nom' => 'Menus & Packs', 'description' => 'Menus complets']);

        // ---------------------------------------------------
        // 1. CRÉATION DES INGRÉDIENTS (Cachés du POS)
        // ---------------------------------------------------
        
        $poulet = ProduitModele::create(['name' => 'Poulet (kg)', 'prix_standard' => 15000, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true]);
        $varPoulet = ProduitVariante::create(['id_modele' => $poulet->id_modele, 'reference_sku' => 'ING-POULET', 'stock_reel' => 50]);

        $riz = ProduitModele::create(['name' => 'Riz Blanc (kg)', 'prix_standard' => 3000, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true]);
        $varRiz = ProduitVariante::create(['id_modele' => $riz->id_modele, 'reference_sku' => 'ING-RIZ', 'stock_reel' => 100]);

        $frites = ProduitModele::create(['name' => 'Pomme de terre Frites (kg)', 'prix_standard' => 4500, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true]);
        $varFrites = ProduitVariante::create(['id_modele' => $frites->id_modele, 'reference_sku' => 'ING-FRITES', 'stock_reel' => 40]);
        
        $boeuf = ProduitModele::create(['name' => 'Viande de Boeuf (kg)', 'prix_standard' => 18000, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true]);
        $varBoeuf = ProduitVariante::create(['id_modele' => $boeuf->id_modele, 'reference_sku' => 'ING-BOEUF', 'stock_reel' => 30]);

        // ---------------------------------------------------
        // 2. PRODUITS SIMPLES (Boissons / Vente Directe)
        // ---------------------------------------------------

        // Demande Spécifique: Cocacola Mini 350ml
        $coca = ProduitModele::create(['name' => 'Cocacola Mini 350ml', 'prix_standard' => 2000, 'id_categorie' => $catBoissons->id_categorie]);
        $varCoca = ProduitVariante::create(['id_modele' => $coca->id_modele, 'reference_sku' => 'BOIS-COCA-350', 'stock_reel' => 120, 'code_barre' => '42117131']);

        // Demande Spécifique: Eau vive GM 1,5L
        $eau = ProduitModele::create(['name' => 'Eau vive GM 1,5L', 'prix_standard' => 3000, 'id_categorie' => $catBoissons->id_categorie]);
        $varEau = ProduitVariante::create(['id_modele' => $eau->id_modele, 'reference_sku' => 'BOIS-EAU-15', 'stock_reel' => 200, 'code_barre' => '9501046019205']);

        // Demande Spécifique: Lait Austria 1L
        $lait = ProduitModele::create(['name' => 'Lait Austria 1L', 'prix_standard' => 4500, 'id_categorie' => $catBoissons->id_categorie]);
        $varLait = ProduitVariante::create(['id_modele' => $lait->id_modele, 'reference_sku' => 'BOIS-LAIT-1L', 'stock_reel' => 60, 'code_barre' => '8410297600012']);

        $jus = ProduitModele::create(['name' => 'Jus Naturel (Verre)', 'prix_standard' => 2500, 'id_categorie' => $catBoissons->id_categorie]);
        $varJus = ProduitVariante::create(['id_modele' => $jus->id_modele, 'reference_sku' => 'BOIS-JUS-NAT', 'stock_reel' => 45]);

        // ---------------------------------------------------
        // 3. CRÉATION DES PACKS (Assiettes et Menus basés sur IP)
        // ---------------------------------------------------

        // A. Plat: Poulet Rôti + Riz
        $platPouletRiz = ProduitModele::create(['name' => 'Plat: Poulet Gasy & Riz', 'prix_standard' => 12000, 'id_categorie' => $catPlats->id_categorie]);
        $varPlatPouletRiz = ProduitVariante::create(['id_modele' => $platPouletRiz->id_modele, 'reference_sku' => 'PLAT-POULETRIZ', 'stock_reel' => 0, 'est_pack' => true]);
        $varPlatPouletRiz->composants()->attach([
            $varPoulet->id_variante => ['quantite' => 0.25], // 250g de poulet
            $varRiz->id_variante => ['quantite' => 0.3],    // 300g de riz
        ]);

        // B. Plat: Steak Frites
        $platSteakFrites = ProduitModele::create(['name' => 'Plat: Steak de Boeuf & Frites', 'prix_standard' => 15000, 'id_categorie' => $catPlats->id_categorie]);
        $varPlatSteakFrites = ProduitVariante::create(['id_modele' => $platSteakFrites->id_modele, 'reference_sku' => 'PLAT-STEAKFRITES', 'stock_reel' => 0, 'est_pack' => true]);
        $varPlatSteakFrites->composants()->attach([
            $varBoeuf->id_variante => ['quantite' => 0.2],  // 200g de boeuf
            $varFrites->id_variante => ['quantite' => 0.25], // 250g de frites
        ]);
        
        // C. Menu Complet (Plat Steak Frites + Coca Mini)
        $menuComplet = ProduitModele::create(['name' => 'Menu: Steak Frites + Coca', 'prix_standard' => 16000, 'id_categorie' => $catMenus->id_categorie]);
        $varMenuComplet = ProduitVariante::create(['id_modele' => $menuComplet->id_modele, 'reference_sku' => 'MENU-STK-COCA', 'stock_reel' => 0, 'est_pack' => true]);
        $varMenuComplet->composants()->attach([
            $varBoeuf->id_variante => ['quantite' => 0.2],  // L'ingrédient directement pour éviter chainage complexe
            $varFrites->id_variante => ['quantite' => 0.25], 
            $varCoca->id_variante => ['quantite' => 1],     // Le produit simple boisson
        ]);
    }
}