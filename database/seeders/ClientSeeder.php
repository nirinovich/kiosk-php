<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        Client::create([
            'name' => 'Client Comptoir (Passager)',
            'email' => null,
            'type_client' => 'particulier',
        ]);

        Client::create([
            'name' => 'BBO Madagascar (Déjeuner Équipe)',
            'email' => 'contact@bbo-mada.mg',
            'type_client' => 'entreprise',
            'nif' => '4001234567',
            'stat' => '620111120150',
            'rcs_ville' => 'Antananarivo'
        ]);

        Client::create([
            'name' => 'Jean-Luc Rabemananjara',
            'email' => 'jeanluc.rabe@gmail.com',
            'type_client' => 'particulier',
            'telephone' => '034 00 123 45'
        ]);
    }
}
