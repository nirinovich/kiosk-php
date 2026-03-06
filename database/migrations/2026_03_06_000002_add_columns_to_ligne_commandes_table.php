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
        Schema::table('ligne_commandes', function (Blueprint $table) {
            $table->unsignedBigInteger('id_commande')->after('id');
            $table->unsignedBigInteger('id_variante')->nullable()->after('id_commande');
            $table->string('designation')->after('id_variante');
            $table->integer('quantite')->after('designation');
            $table->decimal('prix_unitaire', 12, 2)->after('quantite');
            $table->decimal('taux_tva', 5, 2)->default(20.00)->after('prix_unitaire');
            $table->decimal('remise_ligne', 12, 2)->default(0)->after('taux_tva');
            $table->decimal('sous_total', 12, 2)->after('remise_ligne');

            $table->foreign('id_commande')->references('id')->on('commandes')->onDelete('cascade');
            $table->foreign('id_variante')->references('id_variante')->on('produit_variantes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ligne_commandes', function (Blueprint $table) {
            $table->dropForeign(['id_commande']);
            $table->dropForeign(['id_variante']);
            $table->dropColumn([
                'id_commande',
                'id_variante',
                'designation',
                'quantite',
                'prix_unitaire',
                'taux_tva',
                'remise_ligne',
                'sous_total',
            ]);
        });
    }
};
