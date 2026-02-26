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
        Schema::table('produit_modeles', function (Blueprint $table) {
            $table->unsignedBigInteger('id_categorie')->nullable();
            $table->foreign('id_categorie')->references('id_categorie')->on('categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produit_modeles', function (Blueprint $table) {
            $table->dropForeign(['id_categorie']);
            $table->dropColumn('id_categorie');
        });
    }
};
