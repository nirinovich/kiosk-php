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
        Schema::create('produit_variantes', function (Blueprint $table) {
            $table->id('id_variante');
            $table->unsignedBigInteger('id_modele');
            $table->string('reference_sku', 50)->unique()->nullable();
            $table->string('code_barre', 50)->nullable();
            $table->integer('stock_reel')->default(0);
            $table->decimal('surcout_prix', 10, 2)->default(0.00);
            $table->timestamps();

            $table->foreign('id_modele')->references('id_modele')->on('produit_modeles')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produit_variantes');
    }
};
