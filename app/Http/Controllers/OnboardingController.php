<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\CreateNewUser;
use App\Models\ParametresEntreprise;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private readonly CreateNewUser $createUser,
    ) {}

    /**
     * Determine which onboarding step we're on based on DB state.
     */
    private function resolveStep(): int
    {
        $sessionStep = (int) session('onboarding_step', 1);

        // No company info yet → step 1
        if (!ParametresEntreprise::query()->exists()) {
            return 1;
        }

        // No users at all → step 1 or 2 (company/admin)
        if (User::count() === 0) {
            return max(1, min($sessionStep, 2));
        }

        // Admin exists but no vendeur yet AND session flag says still onboarding → step 1..4
        $hasVendeur = User::whereHas('role', fn ($q) => $q->where('nom', Role::VENDEUR))->exists();

        if (!$hasVendeur && session('onboarding_in_progress')) {
            return max(1, min($sessionStep, 4));
        }

        // Vendeur exists and still onboarding → step 1..4
        if ($hasVendeur && session('onboarding_in_progress')) {
            return max(1, min($sessionStep, 4));
        }

        // Fallback (shouldn't reach here due to middleware)
        return 1;
    }

    /**
     * Step 1: Save company information.
     */
    public function storeCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nom_commercial' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'adresse' => ['nullable', 'string'],
            'raison_sociale' => ['nullable', 'string', 'max:255'],
            'nif' => ['nullable', 'string', 'max:50'],
            'stat' => ['nullable', 'string', 'max:50'],
            'capital_social' => ['nullable', 'string', 'max:50'],
            'rcs_ville' => ['nullable', 'string', 'max:100'],
            'site_web' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated) {
            $company = ParametresEntreprise::query()->first();

            if ($company) {
                $company->update($validated);
                return;
            }

            ParametresEntreprise::query()->create($validated);
        });

        $hasAdmin = User::whereHas('role', fn ($q) => $q->where('nom', Role::ADMIN))->exists();

        session(['onboarding_step' => $hasAdmin ? 3 : 2]);

        return redirect()->route('onboarding.show')
            ->with('message', 'Informations de l\'entreprise enregistrées avec succès.');
    }

    /**
     * Navigate to a specific onboarding step.
     */
    public function setStep(Request $request): RedirectResponse
    {
        $targetStep = (int) $request->validate([
            'step' => ['required', 'integer', 'min:1', 'max:4'],
        ])['step'];

        $companyExists = ParametresEntreprise::query()->exists();
        $userCount = User::count();
        $inProgress = (bool) session('onboarding_in_progress');

        if (!$companyExists) {
            $targetStep = 1;
        } elseif ($userCount === 0) {
            $targetStep = max(1, min($targetStep, 2));
        } elseif ($inProgress) {
            $targetStep = max(1, min($targetStep, 4));
        } else {
            $targetStep = 1;
        }

        session(['onboarding_step' => $targetStep]);

        return redirect()->route('onboarding.show');
    }

    /**
     * Show the onboarding wizard.
     */
    public function show(): Response
    {
        $company = ParametresEntreprise::query()->first([
            'nom_commercial',
            'email',
            'telephone',
            'adresse',
            'raison_sociale',
            'nif',
            'stat',
            'capital_social',
            'rcs_ville',
            'site_web',
        ]);

        return Inertia::render('onboarding/index', [
            'step' => $this->resolveStep(),
            'company' => $company,
        ]);
    }

    /**
     * Ensure roles exist in the database.
     */
    private function ensureRolesExist(): void
    {
        foreach ([Role::ADMIN, Role::GERANT, Role::VENDEUR] as $nom) {
            Role::firstOrCreate(['nom' => $nom]);
        }
    }

    /**
     * Step 2: Create the first admin user and log them in.
     */
    public function storeAdmin(Request $request): RedirectResponse
    {
        $existingAdmin = User::whereHas('role', fn ($q) => $q->where('nom', Role::ADMIN))->exists();

        if ($existingAdmin && session('onboarding_in_progress')) {
            session(['onboarding_step' => 3]);

            return redirect()->route('onboarding.show')
                ->with('message', 'Compte administrateur déjà configuré.');
        }

        $user = DB::transaction(function () use ($request) {
            $this->ensureRolesExist();

            $adminRole = Role::where('nom', Role::ADMIN)->firstOrFail();

            return $this->createUser->create([
                ...$request->only('name', 'email', 'password', 'password_confirmation'),
                'role_id' => $adminRole->id,
            ]);
        });

        Auth::login($user);
        Cache::forget('onboarding_needed');

        // Mark onboarding as in-progress so the middleware lets us through
        session(['onboarding_in_progress' => true, 'onboarding_step' => 3]);

        return redirect()->route('onboarding.show')
            ->with('message', 'Compte administrateur créé avec succès.');
    }

    /**
     * Step 3 (optional): Create a vendeur user.
     */
    public function storeVendeur(Request $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $vendeurRole = Role::where('nom', Role::VENDEUR)->firstOrFail();

            $this->createUser->create([
                ...$request->only('name', 'email', 'password', 'password_confirmation'),
                'role_id' => $vendeurRole->id,
            ]);
        });

        session(['onboarding_step' => 4]);

        return redirect()->route('onboarding.show')
            ->with('message', 'Compte vendeur créé avec succès.');
    }

    /**
     * Skip step 3: advance to step 4 without creating a vendeur.
     */
    public function skip(): RedirectResponse
    {
        session(['onboarding_step' => 4]);

        return redirect()->route('onboarding.show');
    }

    /**
     * Final step: clear onboarding session and redirect to dashboard.
     */
    public function finish(): RedirectResponse
    {
        session()->forget(['onboarding_in_progress', 'onboarding_step']);

        return redirect('/dashboard');
    }
}
