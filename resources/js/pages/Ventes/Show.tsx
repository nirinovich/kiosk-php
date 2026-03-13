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

            <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6 pb-2">

                {/* ── Flash message ── */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                        <CheckCircle2 className="size-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* ── Page header ── */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={ventes.index().url}>
                            <Button variant="outline" size="icon" className="shrink-0 h-8 w-8">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">{commande.numero_commande}</h1>
                            <p className="text-muted-foreground text-xs mt-0.5">
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
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400 select-none">
                            <CheckCircle2 className="size-3.5" />
                            Facturée
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 select-none">
                            <Clock className="size-3.5" />
                            Non facturée
                        </span>
                    )}
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* ══ LEFT — Lignes de commande ══ */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm border-border/60">
                            <CardHeader className="px-4 py-3 border-b border-border/40">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                                    Lignes de commande
                                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-muted text-foreground px-1.5 py-0.5 text-[10px] font-bold leading-none">
                                        {commande.lignes.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Table */}
                                <div className="overflow-x-auto px-4 py-2 border-b border-border/40">
                                    <table className="w-full text-xs sm:text-[13px]">
                                        <thead>
                                            <tr className="text-left">
                                                <th className="pb-2 pr-2 font-medium text-muted-foreground">Désignation</th>
                                                <th className="pb-2 px-2 text-center font-medium text-muted-foreground whitespace-nowrap">P.U.</th>
                                                <th className="pb-2 px-2 text-center font-medium text-muted-foreground">Qté</th>
                                                {hasRemiseLigne && (
                                                    <th className="pb-2 px-2 text-center font-medium text-muted-foreground">Remise</th>
                                                )}
                                                <th className="pb-2 px-2 text-center font-medium text-muted-foreground">TVA</th>
                                                <th className="pb-2 pl-2 text-right font-medium text-muted-foreground whitespace-nowrap">Sous-total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {commande.lignes.map((ligne) => (
                                                <tr key={ligne.id}>
                                                    <td className="py-2 pr-2 text-foreground">
                                                        {ligne.designation}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">
                                                        {fmtAr(ligne.prix_unitaire)}
                                                    </td>
                                                    <td className="py-2 px-2 text-center font-medium text-foreground">
                                                        {ligne.quantite}
                                                    </td>
                                                    {hasRemiseLigne && (
                                                        <td className="py-2 px-2 text-center whitespace-nowrap">
                                                            {Number(ligne.remise_ligne) > 0 ? (
                                                                <span className="text-destructive font-medium">-{fmtAr(ligne.remise_ligne)}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground/40">—</span>
                                                            )}
                                                        </td>
                                                    )}
                                                    <td className="py-2 px-2 text-center text-muted-foreground">
                                                        {ligne.taux_tva}%
                                                    </td>
                                                    <td className="py-2 pl-2 text-right font-bold text-foreground whitespace-nowrap">
                                                        {fmtAr(ligne.sous_total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ── Totals section at the bottom of the card ── */}
                                <div className="px-4 py-3 bg-card/50">
                                    <div className="ml-auto w-full max-w-[240px] space-y-1.5 text-xs">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Total HT</span>
                                            <span className="font-semibold text-foreground text-right">{fmtAr(commande.montant_ht)}</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>TVA</span>
                                            <span className="font-semibold text-foreground text-right">{fmtAr(commande.montant_tva)}</span>
                                        </div>
                                        {Number(commande.remise) > 0 && (
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Remise</span>
                                                <span className="font-semibold text-destructive text-right">-{fmtAr(commande.remise)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 mt-1 border-t border-border/40 text-sm font-bold text-foreground items-end">
                                            <span>Total TTC</span>
                                            <span className="text-base">{fmtAr(commande.montant_ttc)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ══ RIGHT panel ══ */}
                    <div className="space-y-4 lg:sticky lg:top-4">
                        <Card className="shadow-sm border-border/60 flex flex-col overflow-hidden">
                            {/* Client */}
                            <div className="p-4 border-b border-border/40 bg-card/50">
                                <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                                    <User className="size-3" />
                                    Client
                                </h3>
                                {commande.client ? (
                                    <div className="space-y-0.5 text-xs">
                                        <p className="font-semibold text-foreground">{commande.client.name}</p>
                                        {commande.client.telephone && (
                                            <p className="text-muted-foreground">{commande.client.telephone}</p>
                                        )}
                                        {commande.client.email && (
                                            <p className="text-muted-foreground">{commande.client.email}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-xs italic">Vente au comptoir</p>
                                )}
                            </div>

                            {/* Facturation */}
                            <div className={`p-4 border-b border-border/40 ${
                                facturee 
                                ? 'bg-green-50/50 dark:bg-green-950/20' 
                                : 'bg-amber-50/50 dark:bg-amber-950/20'
                            }`}>
                                <h3 className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2.5 ${
                                    facturee 
                                    ? 'text-green-700 dark:text-green-500' 
                                    : 'text-amber-700 dark:text-amber-500'
                                }`}>
                                    {facturee ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                                    Facturation
                                </h3>
                                {facturee ? (
                                    <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
                                        <CheckCircle2 className="size-3.5 shrink-0" />
                                        <span className="font-medium">Confirmée</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                                            À valider une fois le paiement reçu.
                                        </p>
                                        <Button
                                            id="btn-confirmer-facturation"
                                            size="sm"
                                            className="w-full gap-1.5 h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-none"
                                            onClick={handleValider}
                                        >
                                            <CheckCircle2 className="size-3.5" />
                                            Confirmer
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Impression */}
                            <div className="p-4 space-y-2 bg-card/50">
                                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                                    Impression
                                </h3>
                                <div className="grid gap-2">
                                    <Button
                                        id="btn-print-thermal"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 justify-start gap-2 border-border/60 hover:bg-muted/50 text-xs text-foreground/80 shadow-none"
                                        onClick={() => printReceipt(toPrintCommande(), 'thermal', entreprise)}
                                    >
                                        <Printer className="size-3.5" />
                                        Ticket de caisse
                                    </Button>

                                    <Button
                                        id="btn-print-a4"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 justify-start gap-2 border-border/60 hover:bg-muted/50 text-xs text-foreground/80 shadow-none"
                                        onClick={() => printReceipt(toPrintCommande(), 'a4', entreprise)}
                                    >
                                        <FileText className="size-3.5" />
                                        Facture A4
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
