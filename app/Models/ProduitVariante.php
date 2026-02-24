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
        'surcout_prix'
    ];

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
}
