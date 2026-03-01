<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('parametres_entreprise')) {
            Schema::create('parametres_entreprise', function (Blueprint $table) {
                $table->id('id_entreprise');
                $table->string('nom_commercial', 255);
                $table->string('raison_sociale', 255)->nullable();
                $table->string('nif', 50)->nullable();
                $table->string('stat', 50)->nullable();
                $table->string('capital_social', 50)->nullable();
                $table->string('rcs_ville', 100)->nullable();
                $table->text('adresse')->nullable();
                $table->string('email', 255)->nullable();
                $table->string('telephone', 20)->nullable();
                $table->string('site_web', 255)->nullable();
                $table->string('logo_url', 255)->nullable();
                $table->string('iban', 50)->nullable();
                $table->string('bic', 20)->nullable();
                $table->text('note_pied_page')->nullable();
            });
        }

        if (Schema::hasTable('parametres_entreprises')) {
            $rows = DB::table('parametres_entreprises')->get();

            foreach ($rows as $row) {
                DB::table('parametres_entreprise')->insert([
                    'nom_commercial' => $row->nom_commercial ?? 'Entreprise',
                    'raison_sociale' => $row->raison_sociale ?? null,
                    'nif' => $row->nif ?? null,
                    'stat' => $row->stat ?? null,
                    'capital_social' => $row->capital_social ?? null,
                    'rcs_ville' => $row->rcs_ville ?? null,
                    'adresse' => $row->adresse ?? null,
                    'email' => $row->email ?? null,
                    'telephone' => $row->telephone ?? null,
                    'site_web' => $row->site_web ?? null,
                    'logo_url' => $row->logo_url ?? null,
                    'iban' => $row->iban ?? null,
                    'bic' => $row->bic ?? null,
                    'note_pied_page' => $row->note_pied_page ?? null,
                ]);
            }

            Schema::drop('parametres_entreprises');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('parametres_entreprises')) {
            Schema::create('parametres_entreprises', function (Blueprint $table) {
                $table->id('id_entreprise');
                $table->string('nom_commercial');
                $table->string('raison_sociale')->nullable();
                $table->string('nif', 50)->nullable();
                $table->string('stat', 50)->nullable();
                $table->string('capital_social', 50)->nullable();
                $table->string('rcs_ville', 100)->nullable();
                $table->text('adresse')->nullable();
                $table->string('email')->nullable();
                $table->string('telephone', 20)->nullable();
                $table->string('site_web')->nullable();
                $table->string('logo_url')->nullable();
                $table->string('iban', 50)->nullable();
                $table->string('bic', 20)->nullable();
                $table->text('note_pied_page')->nullable();
            });
        }

        if (Schema::hasTable('parametres_entreprise')) {
            $rows = DB::table('parametres_entreprise')->get();

            foreach ($rows as $row) {
                DB::table('parametres_entreprises')->insert([
                    'nom_commercial' => $row->nom_commercial ?? 'Entreprise',
                    'raison_sociale' => $row->raison_sociale ?? null,
                    'nif' => $row->nif ?? null,
                    'stat' => $row->stat ?? null,
                    'capital_social' => $row->capital_social ?? null,
                    'rcs_ville' => $row->rcs_ville ?? null,
                    'adresse' => $row->adresse ?? null,
                    'email' => $row->email ?? null,
                    'telephone' => $row->telephone ?? null,
                    'site_web' => $row->site_web ?? null,
                    'logo_url' => $row->logo_url ?? null,
                    'iban' => $row->iban ?? null,
                    'bic' => $row->bic ?? null,
                    'note_pied_page' => $row->note_pied_page ?? null,
                ]);
            }

            Schema::drop('parametres_entreprise');
        }
    }
};
