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
        Schema::create('valeur_attributs', function (Blueprint $table) {
            $table->id('id_valeur');
            $table->unsignedBigInteger('id_attribut');
            $table->string('nom_valeur', 50); // Ex: "XL", "Rouge"
            $table->timestamps();

            $table->foreign('id_attribut')->references('id_attribut')->on('attributs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('valeur_attributs');
    }
};
