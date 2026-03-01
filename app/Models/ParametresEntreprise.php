<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametresEntreprise extends Model
{
    protected $table = 'parametres_entreprise';
    protected $primaryKey = 'id_entreprise';
    public $timestamps = false;

    protected $fillable = [
        'nom_commercial',
        'raison_sociale',
        'nif',
        'stat',
        'capital_social',
        'rcs_ville',
        'adresse',
        'email',
        'telephone',
        'site_web',
        'logo_url',
        'iban',
        'bic',
        'note_pied_page'
    ];
}
