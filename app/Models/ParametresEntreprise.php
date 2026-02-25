<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametresEntreprise extends Model
{
    protected $table = 'parametres_entreprises';
    protected $primaryKey = 'id_entreprise';

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
