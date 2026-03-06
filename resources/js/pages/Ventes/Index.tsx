import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import ventes from '@/routes/ventes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Search, InfoIcon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journal des ventes" />

            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Journal des ventes</h1>
                    <Link href={ventes.create().url}>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Nouvelle vente
                        </Button>
                    </Link>
                </div>

                {/* Flash messages */}
                {(flash.success || flash.message) && (
                    <Alert>
                        <InfoIcon className="size-4" />
                        <AlertTitle>Notification</AlertTitle>
                        <AlertDescription>{flash.success || flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher par n° commande ou nom client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-9"
                        />
                    </div>
                    <div>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Date début"
                        />
                    </div>
                    <div>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Date fin"
                        />
                    </div>
                    <Button variant="secondary" onClick={applyFilters}>
                        Filtrer
                    </Button>
                    {(filters.search || filters.date_from || filters.date_to) && (
                        <Button variant="outline" onClick={resetFilters}>
                            Réinitialiser
                        </Button>
                    )}
                </div>

                {/* Table */}
                {commandes.data.length === 0 ? (
                    <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center">
                        Aucune vente trouvée.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableCaption>
                                {commandes.total} vente{commandes.total > 1 ? 's' : ''} au total
                            </TableCaption>
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
                                        <TableCell>
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
                                            {commande.lignes_count}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {Number(commande.montant_ttc).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={commande.statut_facturation === 'facturee' ? 'default' : 'secondary'}
                                            >
                                                {commande.statut_facturation === 'facturee' ? 'Facturée' : 'Non facturée'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {commandes.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
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
                )}
            </div>
        </AppLayout>
    );
}
