<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboarded
{
    /**
     * If zero users exist, redirect to onboarding.
     * The result is cached for 60 seconds to avoid a COUNT query on every request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $needsOnboarding = Cache::remember('onboarding_needed', 60, function () {
            return User::count() === 0;
        });

        if ($needsOnboarding) {
            return redirect()->route('onboarding.show');
        }

        return $next($request);
    }
}
