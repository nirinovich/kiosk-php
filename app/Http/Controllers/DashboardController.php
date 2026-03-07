<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Commande;
use App\Models\Facture;
use App\Models\LigneCommande;
use App\Models\ProduitModele;
use App\Models\ProduitVariante;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // ── Total revenue (all time) ──
        $totalRevenue = Commande::sum('montant_ttc');

        // ── Monthly revenue ──
        $monthlyRevenue = Commande::where('created_at', '>=', $startOfMonth)->sum('montant_ttc');

        // ── Today's revenue ──
        $todayRevenue = Commande::whereDate('created_at', $today)->sum('montant_ttc');

        // ── Number of sales ──
        $totalOrders = Commande::count();
        $monthlyOrders = Commande::where('created_at', '>=', $startOfMonth)->count();
        $todayOrders = Commande::whereDate('created_at', $today)->count();

        // ── Number of clients ──
        $totalClients = Client::count();

        // ── Number of products ──
        $totalProducts = ProduitModele::count();

        // ── Most sold product (by quantity) ──
        $topProduct = LigneCommande::select('designation', DB::raw('SUM(quantite) as total_qty'))
            ->groupBy('designation')
            ->orderByDesc('total_qty')
            ->first();

        // ── Recent sales (last 5) ──
        $recentSales = Commande::with('client')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'numero' => $c->numero_commande,
                'client' => $c->client?->name ?? 'N/A',
                'montant_ttc' => $c->montant_ttc,
                'date' => $c->created_at->format('d/m/Y H:i'),
            ]);

        // ── Low-stock variants (stock ≤ 5) ──
        $lowStock = ProduitVariante::with('modele')
            ->where('stock_reel', '<=', 5)
            ->orderBy('stock_reel')
            ->limit(5)
            ->get()
            ->map(fn($v) => [
                'id_variante' => $v->id_variante,
                'product' => $v->modele?->name ?? 'N/A',
                'sku' => $v->reference_sku,
                'stock' => $v->stock_reel,
            ]);

        return Inertia::render('dashboard', [
            'kpis' => [
                'totalRevenue' => (float) $totalRevenue,
                'monthlyRevenue' => (float) $monthlyRevenue,
                'todayRevenue' => (float) $todayRevenue,
                'totalOrders' => $totalOrders,
                'monthlyOrders' => $monthlyOrders,
                'todayOrders' => $todayOrders,
                'totalClients' => $totalClients,
                'totalProducts' => $totalProducts,
                'topProduct' => $topProduct ? [
                    'name' => $topProduct->designation,
                    'qty' => (int) $topProduct->total_qty,
                ] : null,
            ],
            'recentSales' => $recentSales,
            'lowStock' => $lowStock,
        ]);
    }
}
