<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    public const ADMIN = 'Admin';
    public const GERANT = 'Gérant';
    public const VENDEUR = 'Vendeur';

    protected $table = 'roles';

    protected $fillable = ['nom'];

    /**
     * Users belonging to this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
