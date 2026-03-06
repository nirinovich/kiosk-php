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
        Schema::table('ligne_factures', function (Blueprint $table) {
            $table->unsignedBigInteger('id_facture')->after('id');
            $table->string('designation')->after('id_facture');
            $table->integer('quantite')->after('designation');
            $table->decimal('prix_unitaire', 12, 2)->after('quantite');
            $table->decimal('taux_tva', 5, 2)->default(20.00)->after('prix_unitaire');
            $table->decimal('sous_total', 12, 2)->after('taux_tva');

            $table->foreign('id_facture')->references('id')->on('factures')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ligne_factures', function (Blueprint $table) {
            $table->dropForeign(['id_facture']);
            $table->dropColumn([
                'id_facture',
                'designation',
                'quantite',
                'prix_unitaire',
                'taux_tva',
                'sous_total',
            ]);
        });
    }
};
