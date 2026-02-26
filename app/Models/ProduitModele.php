<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProduitModele extends Model
{
    use HasFactory;
    protected $table = 'produit_modeles';
    protected $primaryKey = 'id_modele';

    protected $fillable = ['name', 'prix_standard', 'description','id_categorie'];

    public function variantes()
    {
        return $this->hasMany(ProduitVariante::class, 'id_modele', 'id_modele');
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'id_categorie');
    }
}
