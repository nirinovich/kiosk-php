<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValeurAttribut extends Model
{
    use HasFactory;

    protected $table = 'valeur_attributs';
    protected $primaryKey = 'id_valeur';

    protected $fillable = ['id_attribut', 'nom_valeur'];

    //Une valeur appartient à un attribut
    public function attribut()
    {
        return $this->belongsTo(Attribut::class, 'id_attribut', 'id_attribut');
    }

    //Une valeur (ex: "Rouge") peut être sur plusieurs variantes de produits
    public function variantes()
    {
        return $this->belongsToMany(
            ProduitVariante::class,
            'rel_variante_valeur',
            'id_valeur',
            'id_variante'
        );
    }
}
