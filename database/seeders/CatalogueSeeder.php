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
        
        $poulet = ProduitModele::create(['name' => 'Poulet (kg)', 'prix_standard' => 15000, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true, 'image_url' => 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=600&auto=format&fit=crop']);
        $varPoulet = ProduitVariante::create(['id_modele' => $poulet->id_modele, 'reference_sku' => 'ING-POULET', 'stock_reel' => 50]);

        $riz = ProduitModele::create(['name' => 'Riz Blanc (kg)', 'prix_standard' => 3000, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true, 'image_url' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop']);
        $varRiz = ProduitVariante::create(['id_modele' => $riz->id_modele, 'reference_sku' => 'ING-RIZ', 'stock_reel' => 100]);

        $frites = ProduitModele::create(['name' => 'Pomme de terre Frites (kg)', 'prix_standard' => 4500, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true, 'image_url' => 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=600&auto=format&fit=crop']);
        $varFrites = ProduitVariante::create(['id_modele' => $frites->id_modele, 'reference_sku' => 'ING-FRITES', 'stock_reel' => 40]);
        
        $boeuf = ProduitModele::create(['name' => 'Viande de Boeuf (kg)', 'prix_standard' => 18000, 'id_categorie' => $catIngredients->id_categorie, 'is_ingredient' => true, 'image_url' => 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=600&auto=format&fit=crop']);
        $varBoeuf = ProduitVariante::create(['id_modele' => $boeuf->id_modele, 'reference_sku' => 'ING-BOEUF', 'stock_reel' => 30]);

        // ---------------------------------------------------
        // 2. PRODUITS SIMPLES (Boissons / Vente Directe)
        // ---------------------------------------------------

        $coca = ProduitModele::create(['name' => 'Cocacola Mini 350ml', 'prix_standard' => 2000, 'id_categorie' => $catBoissons->id_categorie, 'image_url' => 'images/Cola.png']);
        $varCoca = ProduitVariante::create(['id_modele' => $coca->id_modele, 'reference_sku' => 'BOIS-COCA-350', 'stock_reel' => 120, 'code_barre' => '42117131']);

        $eau = ProduitModele::create(['name' => 'Eau vive GM 1,5L', 'prix_standard' => 3000, 'id_categorie' => $catBoissons->id_categorie, 'image_url' => 'images/EauVive.png']);
        $varEau = ProduitVariante::create(['id_modele' => $eau->id_modele, 'reference_sku' => 'BOIS-EAU-15', 'stock_reel' => 200, 'code_barre' => '9501046019205']);

        $lait = ProduitModele::create(['name' => 'Lait Austria 1L', 'prix_standard' => 4500, 'id_categorie' => $catBoissons->id_categorie, 'image_url' => 'images/Milk.png']);
        $varLait = ProduitVariante::create(['id_modele' => $lait->id_modele, 'reference_sku' => 'BOIS-LAIT-1L', 'stock_reel' => 60, 'code_barre' => '8410297600012']);

        $jus = ProduitModele::create(['name' => 'Jus Naturel (Verre)', 'prix_standard' => 2500, 'id_categorie' => $catBoissons->id_categorie, 'image_url' => 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop']);
        $varJus = ProduitVariante::create(['id_modele' => $jus->id_modele, 'reference_sku' => 'BOIS-JUS-NAT', 'stock_reel' => 45]);

        // ---------------------------------------------------
        // 3. CRÉATION DES PACKS (Assiettes et Menus basés sur IP)
        // ---------------------------------------------------

        $platPouletRiz = ProduitModele::create(['name' => 'Plat: Poulet Gasy & Riz', 'prix_standard' => 12000, 'id_categorie' => $catPlats->id_categorie, 'image_url' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop']);
        $varPlatPouletRiz = ProduitVariante::create(['id_modele' => $platPouletRiz->id_modele, 'reference_sku' => 'PLAT-POULETRIZ', 'stock_reel' => 0, 'est_pack' => true]);
        $varPlatPouletRiz->composants()->attach([
            $varPoulet->id_variante => ['quantite' => 0.25], 
            $varRiz->id_variante => ['quantite' => 0.3],    
        ]);

        $platSteakFrites = ProduitModele::create(['name' => 'Plat: Steak de Boeuf & Frites', 'prix_standard' => 15000, 'id_categorie' => $catPlats->id_categorie, 'image_url' => 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=600&auto=format&fit=crop']);
        $varPlatSteakFrites = ProduitVariante::create(['id_modele' => $platSteakFrites->id_modele, 'reference_sku' => 'PLAT-STEAKFRITES', 'stock_reel' => 0, 'est_pack' => true]);
        $varPlatSteakFrites->composants()->attach([
            $varBoeuf->id_variante => ['quantite' => 0.2],  
            $varFrites->id_variante => ['quantite' => 0.25], 
        ]);
        
        $menuComplet = ProduitModele::create(['name' => 'Menu: Steak Frites + Coca', 'prix_standard' => 16000, 'id_categorie' => $catMenus->id_categorie, 'image_url' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop']);
        $varMenuComplet = ProduitVariante::create(['id_modele' => $menuComplet->id_modele, 'reference_sku' => 'MENU-STK-COCA', 'stock_reel' => 0, 'est_pack' => true]);
        $varMenuComplet->composants()->attach([
            $varBoeuf->id_variante => ['quantite' => 0.2],  
            $varFrites->id_variante => ['quantite' => 0.25], 
            $varCoca->id_variante => ['quantite' => 1],     
        ]);
    }
}