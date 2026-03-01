<?php

namespace App\Http\Middleware;

use App\Models\Role;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfOnboarded
{
    /**
     * If an admin user already exists AND onboarding is not in progress, redirect away.
     * Uses cache to avoid a JOIN query on every request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Session flag: still going through the wizard
        if (session('onboarding_in_progress')) {
            return $next($request);
        }

        $hasAdmin = Cache::remember('has_admin_user', 60, function () {
            return User::whereHas('role', fn ($q) => $q->where('nom', Role::ADMIN))->exists();
        });

        if ($hasAdmin) {
            return redirect('/');
        }

        return $next($request);
    }
}
