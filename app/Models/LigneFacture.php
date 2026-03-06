<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneFacture extends Model
{
    protected $table = 'ligne_factures';

    protected $fillable = [
        'id_facture',
        'designation',
        'quantite',
        'prix_unitaire',
        'taux_tva',
        'sous_total',
    ];

    public function facture()
    {
        return $this->belongsTo(Facture::class, 'id_facture');
    }
}
