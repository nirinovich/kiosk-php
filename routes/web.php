<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ClientController;
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

    // Clients
    Route::get('/clients',[ClientController::class,'index'])->name('clients.index');
    Route::post('/clients',[ClientController::class,'store'])->name('clients.store');
    Route::get('/clients/create',[ClientController::class,'create'])->name('clients.create');
    Route::get('/clients/{client}/edit',[ClientController::class,'edit'])->name('clients.edit');
    Route::put('/clients/{client}',[ClientController::class,'update'])->name('clients.update');
    Route::delete('/clients/{client}',[ClientController::class,'destroy'])->name('clients.destroy');

});    

require __DIR__.'/settings.php';
