<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $table = 'clients';
    protected $primaryKey = 'id_client';

    protected $fillable = [
        'name', 'email', 'telephone', 'adresse',
        'type_client', 'nif', 'stat', 'rcs_ville'
    ];
}
