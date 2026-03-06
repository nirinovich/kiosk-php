<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommande extends Model
{
    protected $table = 'ligne_commandes';

    protected $fillable = [
        'id_commande',
        'id_variante',
        'designation',
        'quantite',
        'prix_unitaire',
        'taux_tva',
        'remise_ligne',
        'sous_total',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }

    public function variante()
    {
        return $this->belongsTo(ProduitVariante::class, 'id_variante', 'id_variante');
    }
}
