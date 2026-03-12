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
            $table->boolean('is_ingredient')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produit_modeles', function (Blueprint $table) {
            $table->dropColumn('is_ingredient');
        });
    }
};
