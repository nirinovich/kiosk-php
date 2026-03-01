<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\EnterpriseUpdateRequest;
use App\Models\ParametresEntreprise;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EnterpriseController extends Controller
{
    /**
     * Show the enterprise settings page.
     * Accessible to all authenticated users (Vendeur sees read-only).
     */
    public function edit(): Response
    {
        $company = ParametresEntreprise::query()->first([
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
        ]);

        return Inertia::render('settings/enterprise', [
            'company' => $company,
        ]);
    }

    /**
     * Update enterprise settings.
     * Restricted to Admin and Gérant via route middleware.
     */
    public function update(EnterpriseUpdateRequest $request): RedirectResponse
    {
        $company = ParametresEntreprise::query()->firstOrNew();
        $company->fill($request->validated());
        $company->save();

        return to_route('enterprise.edit')
            ->with('status', 'enterprise-updated');
    }
}
