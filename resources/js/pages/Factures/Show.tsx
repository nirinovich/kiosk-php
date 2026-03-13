import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer, User, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ventes from '@/routes/ventes';

interface LigneFacture {
    id: number;
    designation: string;
    quantite: number;
    prix_unitaire: number;
    taux_tva: number;
    sous_total: number;
}

interface Facture {
    id: number;
    numero_facture: string;
    date_emission: string;
    entreprise_nom: string;
    entreprise_adresse: string | null;
    entreprise_nif: string | null;
    entreprise_stat: string | null;
    entreprise_telephone: string | null;
    entreprise_email: string | null;
    entreprise_logo_url: string | null;
    client_nom: string | null;
    client_adresse: string | null;
    client_email: string | null;
    client_telephone: string | null;
    client_nif: string | null;
    montant_ht: number;
    montant_tva: number;
    montant_ttc: number;
    note_pied_page: string | null;
    commande: {
        id: number;
        numero_commande: string;
    };
    lignes: LigneFacture[];
}

interface PageProps {
    facture: Facture;
    [key: string]: unknown;
}

function fmt(value: number): string {
    return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Show() {
    const { facture } = usePage<PageProps>().props;

    return (
        <>
            <Head title={`Facture ${facture.numero_facture}`} />

            {/* Print-hidden controls */}
            <div className="print:hidden mx-auto max-w-[1200px] flex items-center justify-between p-4 md:px-8 pt-8 pb-4">
                <Link href={ventes.show(facture.commande.id).url}>
                    <Button variant="outline" size="sm" className="h-9 px-4">
                        <ArrowLeft className="mr-2 size-4" />
                        Retour à la commande
                    </Button>
                </Link>
                <Button onClick={() => window.print()} size="sm" className="h-9 px-4">
                    <Printer className="mr-2 size-4" />
                    Imprimer (A4)
                </Button>
            </div>

            {/* Invoice content (A4 Format) */}
            <div className="mx-auto max-w-4xl bg-white p-10 print:p-0 print:shadow-none shadow-sm border print:border-none rounded-lg print:rounded-none m-4 md:mx-auto">
                {/* Header: Enterprise info + Facture number */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        {facture.entreprise_logo_url && (
                            <img src={facture.entreprise_logo_url} alt="Logo" className="mb-3 h-14 w-auto object-contain" />
                        )}
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">{facture.entreprise_nom}</h2>
                        {facture.entreprise_adresse && (
                            <p className="text-sm text-gray-600 mt-1">{facture.entreprise_adresse}</p>
                        )}
                        <div className="mt-2 text-sm text-gray-500 space-y-0.5">
                            {facture.entreprise_telephone && <p>Tél: {facture.entreprise_telephone}</p>}
                            {facture.entreprise_email && <p>Email: {facture.entreprise_email}</p>}
                            {facture.entreprise_nif && <p>NIF: {facture.entreprise_nif}</p>}
                            {facture.entreprise_stat && <p>STAT: {facture.entreprise_stat}</p>}
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">FACTURE</h1>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{facture.numero_facture}</p>
                        <div className="mt-4 text-sm text-gray-500 space-y-1 text-right">
                            <p>
                                Date d'émission : <span className="font-medium text-gray-900">{new Date(facture.date_emission).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </p>
                            <p>
                                Référence commande : <span className="font-medium text-gray-900">{facture.commande.numero_commande}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Client info */}
                <div className="mb-10 rounded border border-gray-200 p-5 bg-gray-50/50">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                        <User className="size-3.5" />
                        Facturé à
                    </h3>
                    {facture.client_nom ? (
                        <div className="text-sm space-y-1">
                            <p className="font-semibold text-base text-gray-900">{facture.client_nom}</p>
                            {facture.client_adresse && <p className="text-gray-700">{facture.client_adresse}</p>}
                            <div className="pt-2 space-y-0.5 text-gray-600">
                                {facture.client_telephone && <p>Tél: {facture.client_telephone}</p>}
                                {facture.client_email && <p>Email: {facture.client_email}</p>}
                                {facture.client_nif && <p>NIF: {facture.client_nif}</p>}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm italic text-gray-500">Client au comptoir (Non spécifié)</p>
                    )}
                </div>

                {/* Line items table */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-900 text-left">
                                <th className="pb-3 pr-4 font-bold text-gray-900 uppercase text-xs tracking-wider">Désignation</th>
                                <th className="pb-3 px-4 text-right font-bold text-gray-900 uppercase text-xs tracking-wider whitespace-nowrap">Prix unitaire</th>
                                <th className="pb-3 px-4 text-center font-bold text-gray-900 uppercase text-xs tracking-wider">Qté</th>
                                <th className="pb-3 px-4 text-right font-bold text-gray-900 uppercase text-xs tracking-wider">TVA (%)</th>
                                <th className="pb-3 pl-4 text-right font-bold text-gray-900 uppercase text-xs tracking-wider whitespace-nowrap">Sous-total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {facture.lignes.map((ligne) => (
                                <tr key={ligne.id}>
                                    <td className="py-4 pr-4 font-medium text-gray-900">{ligne.designation}</td>
                                    <td className="py-4 px-4 text-right text-gray-600 whitespace-nowrap">{fmt(ligne.prix_unitaire)} Ar</td>
                                    <td className="py-4 px-4 text-center font-semibold text-gray-900">{ligne.quantite}</td>
                                    <td className="py-4 px-4 text-right text-gray-600">{ligne.taux_tva}%</td>
                                    <td className="py-4 pl-4 text-right font-bold text-gray-900 whitespace-nowrap">{fmt(ligne.sous_total)} Ar</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mb-12 flex justify-end">
                    <div className="w-72 space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Total HT</span>
                            <span className="font-semibold text-gray-900">{fmt(facture.montant_ht)} Ar</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>TVA</span>
                            <span className="font-semibold text-gray-900">{fmt(facture.montant_tva)} Ar</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-gray-300 pt-3 text-lg font-bold text-gray-900">
                            <span>Total TTC</span>
                            <span>{fmt(facture.montant_ttc)} Ar</span>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                {facture.note_pied_page && (
                    <div className="border-t border-gray-200 pt-5 text-center text-xs text-gray-500 whitespace-pre-line">
                        {facture.note_pied_page}
                    </div>
                )}
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    nav, aside, header, footer, [data-slot="sidebar"] { display: none !important; }
                    @page { margin: 1cm; }
                }
            `}</style>
        </>
    );
}
