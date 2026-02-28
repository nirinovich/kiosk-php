<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Client::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'type_client' => 'particulier',
        ]);

        Client::create([
            'name' => 'SARL MonEntreprise',
            'email' => 'contact@entreprise.com',
            'type_client' => 'entreprise',
            'nif' => '123456789',
            'stat' => '987654321',
            'rcs_ville' => 'Antananarivo'
        ]);
    }
}
