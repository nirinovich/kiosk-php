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
        Schema::table('commandes', function (Blueprint $table) {
            $table->string('numero_commande', 20)->unique()->after('id');
            $table->unsignedBigInteger('id_client')->nullable()->after('numero_commande');
            $table->decimal('montant_ht', 12, 2)->default(0)->after('id_client');
            $table->decimal('montant_tva', 12, 2)->default(0)->after('montant_ht');
            $table->decimal('montant_ttc', 12, 2)->default(0)->after('montant_tva');
            $table->decimal('remise', 12, 2)->default(0)->after('montant_ttc');
            $table->enum('statut_facturation', ['facturee', 'non_facturee'])->default('non_facturee')->after('remise');

            $table->foreign('id_client')->references('id_client')->on('clients')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['id_client']);
            $table->dropColumn([
                'numero_commande',
                'id_client',
                'montant_ht',
                'montant_tva',
                'montant_ttc',
                'remise',
                'statut_facturation',
            ]);
        });
    }
};
