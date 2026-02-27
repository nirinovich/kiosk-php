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
        Schema::create('clients', function (Blueprint $table) {
            $table->id('id_client');
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('telephone')->nullable();
            $table->text('adresse')->nullable();
            $table->enum('type_client', ['particulier', 'entreprise'])->default('particulier');
            $table->string('nif')->nullable()->comment('(entreprises uniquement)');
            $table->string('stat')->nullable()->comment('(entreprises uniquement)');
            $table->string('rcs_ville')->nullable()->comment('(entreprises uniquement)');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
