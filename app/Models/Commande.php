<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $table = 'commandes';

    protected $fillable = [
        'numero_commande',
        'id_client',
        'montant_ht',
        'montant_tva',
        'montant_ttc',
        'remise',
        'statut_facturation',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }

    public function lignes()
    {
        return $this->hasMany(LigneCommande::class, 'id_commande');
    }

    public function facture()
    {
        return $this->hasOne(Facture::class, 'id_commande');
    }

    public function mouvementsStock()
    {
        return $this->hasMany(MouvementStock::class, 'id_commande');
    }
}
