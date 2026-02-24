<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth','verified'])->group(function(){
    Route::get('dashboard', function () {
    return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('/products',[ProductController::class,'index'])->name('products.index');
    Route::post('/products',[ProductController::class,'store'])->name('products.store');
    Route::get('/products/create',[ProductController::class,'create'])->name('products.create');
    Route::get('/products/{produit_modele}/edit',[ProductController::class,'edit'])->name('products.edit');
    Route::put('/products/{produit_modele}',[ProductController::class,'update'])->name('products.update');
    Route::delete('/products/{produit_modele}',[ProductController::class,'destroy'])->name('products.destroy');
});

    

require __DIR__.'/settings.php';
