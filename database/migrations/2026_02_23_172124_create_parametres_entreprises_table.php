<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('parametres_entreprises', function (Blueprint $table) {
            $table->id('id_entreprise');
            $table->string('nom_commercial'); // Obligatoire
            $table->string('raison_sociale')->nullable();
            $table->string('nif', 50)->nullable();
            $table->string('stat', 50)->nullable();
            $table->string('capital_social', 50)->nullable();
            $table->string('rcs_ville', 100)->nullable();
            $table->text('adresse')->nullable();
            $table->string('email');
            $table->string('telephone', 20)->nullable();
            $table->string('site_web')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('iban', 50)->nullable();
            $table->string('bic', 20)->nullable();
            $table->text('note_pied_page')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parametres_entreprises');
    }
};
