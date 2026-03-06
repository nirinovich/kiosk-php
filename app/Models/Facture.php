<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $table = 'factures';

    protected $fillable = [
        'numero_facture',
        'id_commande',
        'date_emission',
        'entreprise_nom',
        'entreprise_adresse',
        'entreprise_nif',
        'entreprise_stat',
        'entreprise_telephone',
        'entreprise_email',
        'entreprise_logo_url',
        'client_nom',
        'client_adresse',
        'client_email',
        'client_telephone',
        'client_nif',
        'montant_ht',
        'montant_tva',
        'montant_ttc',
        'note_pied_page',
    ];

    protected $casts = [
        'date_emission' => 'date',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }

    public function lignes()
    {
        return $this->hasMany(LigneFacture::class, 'id_facture');
    }
}
