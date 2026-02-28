<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $primaryKey = 'id_categorie';
    
    protected $fillable = ['nom', 'description'];

    // Une catégorie possède plusieurs produits
    public function produits()
    {
        return $this->hasMany(ProduitModele::class, 'id_categorie', 'id_categorie');
    }
}