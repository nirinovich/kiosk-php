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
        Schema::create('rel_variante_valeur', function (Blueprint $table) {
            $table->unsignedBigInteger('id_variante');
            $table->unsignedBigInteger('id_valeur');

            $table->primary(['id_variante', 'id_valeur']);

            $table->foreign('id_variante')->references('id_variante')->on('produit_variantes')->onDelete('cascade');
            $table->foreign('id_valeur')->references('id_valeur')->on('valeur_attributs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rel_variante_valeur');
    }
};
