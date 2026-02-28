<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attribut extends Model
{
    use HasFactory;

    protected $table = 'attributs';
    protected $primaryKey = 'id_attribut';

    protected $fillable = ['nom'];

    // Un attribut possède plusieurs valeurs (ex: Couleur -> Rouge, Bleu)
    public function valeurs()
    {
        return $this->hasMany(ValeurAttribut::class, 'id_attribut', 'id_attribut');
    }
}
