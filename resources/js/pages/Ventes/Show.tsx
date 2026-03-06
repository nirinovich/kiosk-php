import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import ventes from '@/routes/ventes';
import factures from '@/routes/factures';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, FileText, Printer } from 'lucide-react';

interface LigneCommande {
    id: number;
    designation: string;
    quantite: number;
    prix_unitaire: number;
    taux_tva: number;
    remise_ligne: number;
    sous_total: number;
}

interface Commande {
    id: number;
    numero_commande: string;
    montant_ht: number;
    montant_tva: number;
    montant_ttc: number;
    remise: number;
    statut_facturation: 'facturee' | 'non_facturee';
    created_at: string;
    client: {
        id_client: number;
        name: string;
        email: string | null;
        telephone: string | null;
        adresse: string | null;
    } | null;
    lignes: LigneCommande[];
    facture: {
        id: number;
    } | null;
}

interface PageProps {
    commande: Commande;
    flash: { success?: string };
    [key: string]: unknown;
}

export default function Show() {
    const { commande, flash } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Journal des ventes', href: ventes.index().url },
        { title: `Vente ${commande.numero_commande}`, href: ventes.show(commande.id).url },
    ];

    function handleGenererFacture() {
        router.post(factures.store().url, {
            id_commande: commande.id,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vente ${commande.numero_commande}`} />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={ventes.index().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{commande.numero_commande}</h1>
                            <p className="text-muted-foreground text-sm">
                                {new Date(commande.created_at).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={commande.statut_facturation === 'facturee' ? 'default' : 'secondary'}
                    >
                        {commande.statut_facturation === 'facturee' ? 'Facturée' : 'Non facturée'}
                    </Badge>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left: line items */}
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Lignes de commande</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[40%]">Désignation</TableHead>
                                                <TableHead className="text-right">Prix unitaire</TableHead>
                                                <TableHead className="text-center">Quantité</TableHead>
                                                <TableHead className="text-right">TVA (%)</TableHead>
                                                <TableHead className="text-right">Sous-total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {commande.lignes.map((ligne) => (
                                                <TableRow key={ligne.id}>
                                                    <TableCell className="font-medium">
                                                        {ligne.designation}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {Number(ligne.prix_unitaire).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {ligne.quantite}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {ligne.taux_tva}%
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {Number(ligne.sous_total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: client + totals + actions */}
                    <div className="space-y-4">
                        {/* Client info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Client</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {commande.client ? (
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{commande.client.name}</p>
                                        {commande.client.email && (
                                            <p className="text-muted-foreground">{commande.client.email}</p>
                                        )}
                                        {commande.client.telephone && (
                                            <p className="text-muted-foreground">{commande.client.telephone}</p>
                                        )}
                                        {commande.client.adresse && (
                                            <p className="text-muted-foreground">{commande.client.adresse}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">Vente au comptoir (sans client)</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Totals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Totaux</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total HT</span>
                                        <span>{Number(commande.montant_ht).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">TVA</span>
                                        <span>{Number(commande.montant_tva).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</span>
                                    </div>
                                    {Number(commande.remise) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Remise</span>
                                            <span className="text-destructive">-{Number(commande.remise).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2 text-base font-bold">
                                        <span>Total TTC</span>
                                        <span>{Number(commande.montant_ttc).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="space-y-2">
                            {commande.statut_facturation === 'non_facturee' && (
                                <Button className="w-full" onClick={handleGenererFacture}>
                                    <FileText className="mr-2 size-4" />
                                    Générer la facture
                                </Button>
                            )}
                            {commande.facture && (
                                <Link href={factures.show(commande.facture.id).url} className="block">
                                    <Button variant="outline" className="w-full">
                                        <Printer className="mr-2 size-4" />
                                        Voir la facture
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
