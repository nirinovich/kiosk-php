<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    protected $table = 'mouvement_stocks';

    protected $fillable = [
        'id_variante',
        'type',
        'quantite',
        'id_commande',
        'motif',
    ];

    public function variante()
    {
        return $this->belongsTo(ProduitVariante::class, 'id_variante', 'id_variante');
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }
}
