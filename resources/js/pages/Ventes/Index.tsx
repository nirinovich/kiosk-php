import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, SearchIcon, InfoIcon, ShoppingCart, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import ventes from '@/routes/ventes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Journal des ventes', href: ventes.index().url },
];

interface Commande {
    id: number;
    numero_commande: string;
    montant_ht: number;
    montant_tva: number;
    montant_ttc: number;
    statut_facturation: 'facturee' | 'non_facturee';
    created_at: string;
    lignes_count: number;
    client: {
        id_client: number;
        name: string;
    } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedCommandes {
    data: Commande[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Filters {
    search: string;
    date_from: string;
    date_to: string;
}

interface PageProps {
    commandes: PaginatedCommandes;
    filters: Filters;
    flash: { success?: string; message?: string };
    [key: string]: unknown;
}

function formatMoney(amount: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'decimal', minimumFractionDigits: 0 }).format(amount) + ' MGA';
}

export default function Index() {
    const { commandes, filters, flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    function applyFilters() {
        router.get(
            ventes.index().url,
            { search, date_from: dateFrom, date_to: dateTo },
            { preserveState: true, preserveScroll: true }
        );
    }

    function resetFilters() {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        router.get(ventes.index().url, {}, { preserveState: true });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }

    const hasActiveFilters = !!(filters.search || filters.date_from || filters.date_to);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journal des ventes" />

            <div className="p-4 space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par n° commande ou client..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9"
                            />
                        </div>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-auto"
                        />
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-auto"
                        />
                        <Button variant="secondary" size="sm" onClick={applyFilters}>
                            Filtrer
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Réinitialiser
                            </Button>
                        )}
                    </div>

                    <Link href={ventes.create().url}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle vente
                        </Button>
                    </Link>
                </div>

                {/* Flash messages */}
                {(flash.success || flash.message) && (
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Notification</AlertTitle>
                        <AlertDescription>{flash.success || flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Table or empty state */}
                {commandes.data.length > 0 ? (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>N° Commande</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead className="text-center">Articles</TableHead>
                                    <TableHead className="text-right">Montant TTC</TableHead>
                                    <TableHead className="text-center">Facturation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {commandes.data.map((commande) => (
                                    <TableRow
                                        key={commande.id}
                                        className="cursor-pointer"
                                        onClick={() => router.visit(ventes.show(commande.id).url)}
                                    >
                                        <TableCell className="text-muted-foreground">
                                            {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {commande.numero_commande}
                                        </TableCell>
                                        <TableCell>
                                            {commande.client?.name || (
                                                <span className="text-muted-foreground italic">Comptoir</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{commande.lignes_count}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {formatMoney(Number(commande.montant_ttc))}
                                        </TableCell>
                                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                            {commande.statut_facturation === 'facturee' ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                                    Facturée
                                                </Badge>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                                                    onClick={() => {
                                                        router.patch(ventes.valider(commande.id).url, {}, { preserveScroll: true });
                                                    }}
                                                >
                                                    Valider
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Aucune vente</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            {hasActiveFilters
                                ? 'Aucune vente ne correspond à vos filtres.'
                                : 'Commencez par enregistrer votre première vente.'}
                        </p>
                        {!hasActiveFilters && (
                            <Link href={ventes.create().url}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Enregistrer une vente
                                </Button>
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {commandes.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {commandes.total} vente{commandes.total > 1 ? 's' : ''} au total
                        </p>
                        <div className="flex items-center gap-1">
                            {commandes.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
