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
        Schema::table('factures', function (Blueprint $table) {
            $table->string('numero_facture', 20)->unique()->after('id');
            $table->unsignedBigInteger('id_commande')->after('numero_facture');
            $table->date('date_emission')->after('id_commande');

            // Snapshot entreprise
            $table->string('entreprise_nom')->after('date_emission');
            $table->text('entreprise_adresse')->nullable()->after('entreprise_nom');
            $table->string('entreprise_nif', 50)->nullable()->after('entreprise_adresse');
            $table->string('entreprise_stat', 50)->nullable()->after('entreprise_nif');
            $table->string('entreprise_telephone', 20)->nullable()->after('entreprise_stat');
            $table->string('entreprise_email')->nullable()->after('entreprise_telephone');
            $table->string('entreprise_logo_url')->nullable()->after('entreprise_email');

            // Snapshot client
            $table->string('client_nom')->nullable()->after('entreprise_logo_url');
            $table->text('client_adresse')->nullable()->after('client_nom');
            $table->string('client_email')->nullable()->after('client_adresse');
            $table->string('client_telephone', 20)->nullable()->after('client_email');
            $table->string('client_nif', 50)->nullable()->after('client_telephone');

            // Montants
            $table->decimal('montant_ht', 12, 2)->default(0)->after('client_nif');
            $table->decimal('montant_tva', 12, 2)->default(0)->after('montant_ht');
            $table->decimal('montant_ttc', 12, 2)->default(0)->after('montant_tva');
            $table->text('note_pied_page')->nullable()->after('montant_ttc');

            $table->foreign('id_commande')->references('id')->on('commandes')->onDelete('cascade');
            $table->unique('id_commande');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->dropForeign(['id_commande']);
            $table->dropUnique(['id_commande']);
            $table->dropColumn([
                'numero_facture',
                'id_commande',
                'date_emission',
                'entreprise_nom',
                'entreprise_adresse',
                'entreprise_nif',
                'entreprise_stat',
                'entreprise_telephone',
                'entreprise_email',
                'entreprise_logo_url',
                'client_nom',
                'client_adresse',
                'client_email',
                'client_telephone',
                'client_nif',
                'montant_ht',
                'montant_tva',
                'montant_ttc',
                'note_pied_page',
            ]);
        });
    }
};
