import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileText,
    Printer,
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import ventes from '@/routes/ventes';
import type { BreadcrumbItem } from '@/types';
import { printReceipt, type Entreprise } from '@/lib/print-receipt';

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
    facture: { id: number } | null;
}

interface PageProps {
    commande: Commande;
    entreprise: Entreprise | null;
    flash: { success?: string };
    [key: string]: unknown;
}

function fmtAr(n: number) {
    return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Ar';
}

export default function Show() {
    const { commande, entreprise, flash } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Journal des ventes', href: ventes.index().url },
        { title: `Vente ${commande.numero_commande}`, href: ventes.show(commande.id).url },
    ];

    const facturee = commande.statut_facturation === 'facturee';
    const hasRemiseLigne = commande.lignes.some((l) => Number(l.remise_ligne) > 0);

    function toPrintCommande() {
        return {
            numero_commande: commande.numero_commande,
            montant_ht:      Number(commande.montant_ht),
            montant_tva:     Number(commande.montant_tva),
            montant_ttc:     Number(commande.montant_ttc),
            remise:          Number(commande.remise),
            created_at:      commande.created_at,
            client: commande.client
                ? { name: commande.client.name, telephone: commande.client.telephone }
                : null,
            lignes: commande.lignes.map((l) => ({
                designation:   l.designation,
                quantite:      l.quantite,
                prix_unitaire: Number(l.prix_unitaire),
                remise_ligne:  Number(l.remise_ligne),
                sous_total:    Number(l.sous_total),
                taux_tva:      Number(l.taux_tva),
            })),
        };
    }

    function handleValider() {
        router.patch(ventes.valider(commande.id).url);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vente ${commande.numero_commande}`} />

            <div className="mx-auto max-w-5xl space-y-5 p-4 pb-10">

                {/* ── Flash message ── */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                        <CheckCircle2 className="size-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* ── Page header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={ventes.index().url}>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{commande.numero_commande}</h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                {new Date(commande.created_at).toLocaleDateString('fr-FR', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                })}
                                {' '}·{' '}
                                {new Date(commande.created_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Facturation status pill */}
                    {facturee ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-950/40 dark:text-green-400 select-none">
                            <CheckCircle2 className="size-3.5" />
                            Facturée
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 select-none">
                            <Clock className="size-3.5" />
                            Non facturée
                        </span>
                    )}
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-5 lg:grid-cols-3">

                    {/* ══ LEFT — Lignes de commande ══ */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden">
                            <CardHeader className="border-b bg-muted/30 px-5 py-3.5">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Lignes de commande
                                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                        {commande.lignes.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/20">
                                            <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Désignation</th>
                                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">P.U.</th>
                                            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Qté</th>
                                            {hasRemiseLigne && (
                                                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Remise</th>
                                            )}
                                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">TVA</th>
                                            <th className="px-5 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">Sous-total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {commande.lignes.map((ligne, idx) => (
                                            <tr
                                                key={ligne.id}
                                                className={`transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                                            >
                                                <td className="px-5 py-3.5 font-medium">
                                                    {ligne.designation}
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-muted-foreground whitespace-nowrap">
                                                    {fmtAr(ligne.prix_unitaire)}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-bold">
                                                        {ligne.quantite}
                                                    </span>
                                                </td>
                                                {hasRemiseLigne && (
                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        {Number(ligne.remise_ligne) > 0 ? (
                                                            <span className="text-destructive font-medium">
                                                                -{fmtAr(ligne.remise_ligne)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground/40">—</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3.5 text-right text-muted-foreground">
                                                    {ligne.taux_tva}%
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-semibold whitespace-nowrap">
                                                    {fmtAr(ligne.sous_total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Totals section at the bottom of the card ── */}
                            <div className="border-t bg-muted/20 px-5 py-4">
                                <div className="ml-auto w-56 space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Total HT</span>
                                        <span className="font-medium text-foreground">{fmtAr(commande.montant_ht)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>TVA</span>
                                        <span className="font-medium text-foreground">{fmtAr(commande.montant_tva)}</span>
                                    </div>
                                    {Number(commande.remise) > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Remise</span>
                                            <span className="font-medium text-destructive">-{fmtAr(commande.remise)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between pt-0.5 text-base font-bold">
                                        <span>Total TTC</span>
                                        <span>{fmtAr(commande.montant_ttc)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ══ RIGHT panel ══ */}
                    <div className="space-y-4">

                        {/* Client */}
                        <Card>
                            <CardHeader className="border-b bg-muted/30 px-5 py-3.5">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    <User className="size-3.5" />
                                    Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 py-4">
                                {commande.client ? (
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-base">{commande.client.name}</p>
                                        {commande.client.telephone && (
                                            <p className="text-muted-foreground">{commande.client.telephone}</p>
                                        )}
                                        {commande.client.email && (
                                            <p className="text-muted-foreground">{commande.client.email}</p>
                                        )}
                                        {commande.client.adresse && (
                                            <p className="text-muted-foreground text-xs">{commande.client.adresse}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">Vente au comptoir</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Facturation action */}
                        <Card className={facturee ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'}>
                            <CardHeader className={`border-b px-5 py-3.5 ${facturee ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
                                <CardTitle className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wide ${facturee ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                    {facturee ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                                    Facturation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 py-4">
                                {facturee ? (
                                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                                        <CheckCircle2 className="size-4 shrink-0" />
                                        <span className="font-medium">Cette vente a été confirmée comme facturée.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Marquez cette vente comme facturée une fois le paiement ou la facture confirmé.
                                        </p>
                                        <Button
                                            id="btn-confirmer-facturation"
                                            className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                                            onClick={handleValider}
                                        >
                                            <CheckCircle2 className="size-4" />
                                            Confirmer la facturation
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Impression */}
                        <Card>
                            <CardHeader className="border-b bg-muted/30 px-5 py-3.5">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Impression
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 py-4 space-y-2">
                                <Button
                                    id="btn-print-thermal"
                                    variant="outline"
                                    className="w-full justify-start gap-3 h-auto py-2.5"
                                    onClick={() => printReceipt(toPrintCommande(), 'thermal', entreprise)}
                                >
                                    <Printer className="size-4 shrink-0 text-primary" />
                                    <span className="flex flex-col text-left leading-tight">
                                        <span className="font-medium">Ticket de caisse</span>
                                        <span className="text-muted-foreground text-xs font-normal">Imprimante thermique (80 mm)</span>
                                    </span>
                                </Button>

                                <Button
                                    id="btn-print-a4"
                                    variant="outline"
                                    className="w-full justify-start gap-3 h-auto py-2.5"
                                    onClick={() => printReceipt(toPrintCommande(), 'a4', entreprise)}
                                >
                                    <FileText className="size-4 shrink-0 text-primary" />
                                    <span className="flex flex-col text-left leading-tight">
                                        <span className="font-medium">Facture A4</span>
                                        <span className="text-muted-foreground text-xs font-normal">Format standard (PDF / impression)</span>
                                    </span>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
