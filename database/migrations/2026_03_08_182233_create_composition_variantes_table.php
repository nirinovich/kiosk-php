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
        Schema::create('composition_variantes', function (Blueprint $table) {
            $table->id('id_composition');
            $table->unsignedBigInteger('id_parent'); //(Ex: Hamburger)
            $table->unsignedBigInteger('id_composant'); //(Ex: Pain)
            $table->decimal('quantite', 10, 3); 
            
            // Clés étrangères
            $table->foreign('id_parent')->references('id_variante')->on('produit_variantes')->onDelete('cascade');
            $table->foreign('id_composant')->references('id_variante')->on('produit_variantes')->onDelete('restrict');
            
            $table->unique(['id_parent', 'id_composant']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('composition_variantes');
    }
};
