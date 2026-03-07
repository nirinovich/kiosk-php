import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';

interface KPIs {
    totalRevenue: number;
    monthlyRevenue: number;
    todayRevenue: number;
    totalOrders: number;
    monthlyOrders: number;
    todayOrders: number;
    totalClients: number;
    totalProducts: number;
    topProduct: { name: string; qty: number } | null;
}

interface RecentSale {
    id: number;
    numero: string;
    client: string;
    montant_ttc: number;
    date: string;
}

interface LowStockItem {
    id_variante: number;
    product: string;
    sku: string;
    stock: number;
}

interface DashboardProps {
    kpis: KPIs;
    recentSales: RecentSale[];
    lowStock: LowStockItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

function formatMoney(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', minimumFractionDigits: 0 }).format(value);
}

export default function Dashboard() {
    const { kpis, recentSales, lowStock } = usePage<{ props: DashboardProps }>().props as unknown as DashboardProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                {/* ── KPI Cards ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Revenu du jour</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatMoney(kpis.todayRevenue)}</div>
                            <p className="text-xs text-muted-foreground">{kpis.todayOrders} vente(s) aujourd'hui</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Revenu du mois</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatMoney(kpis.monthlyRevenue)}</div>
                            <p className="text-xs text-muted-foreground">{kpis.monthlyOrders} commande(s) ce mois</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total des ventes</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatMoney(kpis.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">{kpis.totalOrders} commande(s) au total</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Clients & Produits</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.totalClients} <span className="text-base font-normal text-muted-foreground">clients</span></div>
                            <p className="text-xs text-muted-foreground">{kpis.totalProducts} produit(s) en catalogue</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Top Product ── */}
                {kpis.topProduct && (
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 pb-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">Produit le plus vendu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-lg font-semibold">{kpis.topProduct.name}</span>
                            <span className="ml-2 text-muted-foreground">— {kpis.topProduct.qty} unité(s) vendues</span>
                        </CardContent>
                    </Card>
                )}

                {/* ── Bottom section: Recent Sales + Low Stock ── */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Recent Sales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ventes récentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentSales.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucune vente enregistrée.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentSales.map((sale) => (
                                        <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{sale.numero}</p>
                                                <p className="text-xs text-muted-foreground">{sale.client} · {sale.date}</p>
                                            </div>
                                            <span className="text-sm font-semibold">{formatMoney(sale.montant_ttc)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Low Stock Alerts */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <CardTitle className="text-base">Stock faible</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowStock.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Tous les stocks sont suffisants.</p>
                            ) : (
                                <div className="space-y-3">
                                    {lowStock.map((item) => (
                                        <div key={item.id_variante} className="flex items-center justify-between border-b pb-2 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{item.product}</p>
                                                <p className="text-xs text-muted-foreground">SKU: {item.sku ?? '—'}</p>
                                            </div>
                                            <span className={`text-sm font-semibold ${item.stock <= 0 ? 'text-red-600' : 'text-orange-500'}`}>
                                                {item.stock} en stock
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
