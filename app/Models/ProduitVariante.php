<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProduitVariante extends Model
{
    use HasFactory;
    protected $table = 'produit_variantes';
    protected $primaryKey = 'id_variante';

    protected $fillable = [
        'id_modele',
        'reference_sku',
        'code_barre',
        'stock_reel',
        'surcout_prix',
        'est_pack'
    ];

    protected $appends = ['stock_disponible'];

    //Une variante appartient à un modèle parent
    public function modele()
    {
        return $this->belongsTo(ProduitModele::class, 'id_modele', 'id_modele');
    }

    //Une variante possède plusieurs valeurs (ex: Rouge ET Taille M)
    public function valeurs()
    {
        return $this->belongsToMany(
            ValeurAttribut::class,
            'rel_variante_valeur',
            'id_variante',
            'id_valeur'
        );
    }

    public function lignesCommande()
    {
        return $this->hasMany(LigneCommande::class, 'id_variante', 'id_variante');
    }

    public function mouvementsStock()
    {
        return $this->hasMany(MouvementStock::class, 'id_variante', 'id_variante');
    }

    public function composants()
    {
        return $this->belongsToMany(
            ProduitVariante::class,
            'composition_variantes',
            'id_parent',
            'id_composant'
        )->withPivot('quantite'); // On récupère la quantité nécessaire de l'ingrédient
    }

    public function getStockDisponibleAttribute()
    {
        if (!$this->est_pack) {
            return $this->stock_reel;
        }

        // pack mais pas d'ingrédients, stock = 0
        if ($this->composants->isEmpty()) {
            return 0;
        }

        $quantitesPossibles = [];
        foreach ($this->composants as $composant) {
            $quantiteRequise = $composant->pivot->quantite;
            if ($quantiteRequise > 0) {
                $quantitesPossibles[] = floor($composant->stock_reel / $quantiteRequise);
            }
        }
        return min($quantitesPossibles);  // Le stock limité par l'ingrédient dont on a le moins
    }
}
