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
        if (!Schema::hasTable('parametres_entreprises')) {
            return;
        }

        Schema::table('parametres_entreprises', function (Blueprint $table) {
            if (!Schema::hasColumn('parametres_entreprises', 'nom_commercial')) {
                $table->string('nom_commercial')->nullable()->after('id');
            }
            if (!Schema::hasColumn('parametres_entreprises', 'raison_sociale')) {
                $table->string('raison_sociale')->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'nif')) {
                $table->string('nif', 50)->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'stat')) {
                $table->string('stat', 50)->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'capital_social')) {
                $table->string('capital_social', 50)->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'rcs_ville')) {
                $table->string('rcs_ville', 100)->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'adresse')) {
                $table->text('adresse')->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'email')) {
                $table->string('email')->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'telephone')) {
                $table->string('telephone', 20)->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'site_web')) {
                $table->string('site_web')->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'logo_url')) {
                $table->string('logo_url')->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'iban')) {
                $table->string('iban', 50)->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'bic')) {
                $table->string('bic', 20)->nullable();
            }
            if (!Schema::hasColumn('parametres_entreprises', 'note_pied_page')) {
                $table->text('note_pied_page')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('parametres_entreprises')) {
            return;
        }

        Schema::table('parametres_entreprises', function (Blueprint $table) {
            $columns = [
                'nom_commercial',
                'raison_sociale',
                'nif',
                'stat',
                'capital_social',
                'rcs_ville',
                'adresse',
                'email',
                'telephone',
                'site_web',
                'logo_url',
                'iban',
                'bic',
                'note_pied_page',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('parametres_entreprises', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
