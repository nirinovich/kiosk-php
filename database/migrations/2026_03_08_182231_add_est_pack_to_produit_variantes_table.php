<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('produit_variantes', function (Blueprint $table) {
            $table->boolean('est_pack')->default(false)->after('stock_reel');
        });
    }

    public function down()
    {
        Schema::table('produit_variantes', function (Blueprint $table) {
            $table->dropColumn('est_pack');
        });
    }
};
