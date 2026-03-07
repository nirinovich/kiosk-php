<?php

use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\FactureController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Onboarding Routes (no users exist yet)
|--------------------------------------------------------------------------
*/
Route::middleware('not-onboarded')->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('/onboarding/step', [OnboardingController::class, 'setStep'])->name('onboarding.setStep');
    Route::post('/onboarding/company', [OnboardingController::class, 'storeCompany'])->name('onboarding.storeCompany');
    Route::post('/onboarding/admin', [OnboardingController::class, 'storeAdmin'])->name('onboarding.storeAdmin');
    Route::post('/onboarding/utilisateur', [OnboardingController::class, 'storeUtilisateur'])->name('onboarding.storeUtilisateur');
    Route::post('/onboarding/skip', [OnboardingController::class, 'skip'])->name('onboarding.skip');
    Route::post('/onboarding/finish', [OnboardingController::class, 'finish'])->name('onboarding.finish');
});

/*
|--------------------------------------------------------------------------
| Public Routes (users exist → show login / home)
|--------------------------------------------------------------------------
*/
Route::middleware('onboarded')->group(function () {
    Route::get('/', function () {
        if (auth()->check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('welcome');
    })->name('home');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::get('/products/{produit_modele}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{produit_modele}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{produit_modele}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Catégories (création inline depuis la page produit)
    Route::post('/categories', [CategorieController::class, 'store'])->name('categories.store');

    // Clients
    Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
    Route::get('/clients/create', [ClientController::class, 'create'])->name('clients.create');
    Route::get('/clients/{client}/edit', [ClientController::class, 'edit'])->name('clients.edit');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');

    // Ventes (Journal des ventes)
    Route::get('/ventes', [CommandeController::class, 'index'])->name('ventes.index');
    Route::get('/ventes/create', [CommandeController::class, 'create'])->name('ventes.create');
    Route::post('/ventes', [CommandeController::class, 'store'])->name('ventes.store');
    Route::get('/ventes/{commande}', [CommandeController::class, 'show'])->name('ventes.show');

    // Factures
    Route::post('/factures', [FactureController::class, 'store'])->name('factures.store');
    Route::get('/factures/{facture}', [FactureController::class, 'show'])->name('factures.show');
});

require __DIR__.'/settings.php';
