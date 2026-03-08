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
        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->unsignedBigInteger('id_variante')->after('id');
            $table->enum('type', ['achat','vente','inventaire','retour','perte'])->after('id_variante');
            $table->integer('quantite')->after('type');
            $table->unsignedBigInteger('id_commande')->nullable()->after('quantite');
            $table->string('motif')->nullable()->after('id_commande');

            $table->foreign('id_variante')->references('id_variante')->on('produit_variantes')->onDelete('cascade');
            $table->foreign('id_commande')->references('id')->on('commandes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->dropForeign(['id_variante']);
            $table->dropForeign(['id_commande']);
            $table->dropColumn([
                'id_variante',
                'type',
                'quantite',
                'id_commande',
                'motif',
            ]);
        });
    }
};
