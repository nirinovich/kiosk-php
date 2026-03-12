import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
            <div className="print:hidden mx-auto max-w-4xl flex items-center justify-between p-4">
                <Link href={ventes.show(facture.commande.id).url}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 size-4" />
                        Retour à la vente
                    </Button>
                </Link>
                <Button onClick={() => window.print()} size="sm">
                    <Printer className="mr-2 size-4" />
                    Imprimer
                </Button>
            </div>

            {/* Invoice content */}
            <div className="mx-auto max-w-4xl bg-white p-8 print:p-0 print:shadow-none shadow-sm border print:border-none rounded-lg print:rounded-none">
                {/* Header: Enterprise info + Facture number */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {facture.entreprise_logo_url && (
                            <img src={facture.entreprise_logo_url} alt="Logo" className="mb-2 h-12 w-auto" />
                        )}
                        <h2 className="text-xl font-bold">{facture.entreprise_nom}</h2>
                        {facture.entreprise_adresse && (
                            <p className="text-sm text-gray-600">{facture.entreprise_adresse}</p>
                        )}
                        {facture.entreprise_telephone && (
                            <p className="text-sm text-gray-600">Tél: {facture.entreprise_telephone}</p>
                        )}
                        {facture.entreprise_email && (
                            <p className="text-sm text-gray-600">Email: {facture.entreprise_email}</p>
                        )}
                        {facture.entreprise_nif && (
                            <p className="text-sm text-gray-600">NIF: {facture.entreprise_nif}</p>
                        )}
                        {facture.entreprise_stat && (
                            <p className="text-sm text-gray-600">STAT: {facture.entreprise_stat}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-900">FACTURE</h1>
                        <p className="text-lg font-semibold text-primary">{facture.numero_facture}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Date: {new Date(facture.date_emission).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Réf. commande: {facture.commande.numero_commande}
                        </p>
                    </div>
                </div>

                {/* Client info */}
                <div className="mb-8 rounded-md border border-gray-200 p-4">
                    <h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">Facturé à</h3>
                    {facture.client_nom ? (
                        <div className="text-sm">
                            <p className="font-medium">{facture.client_nom}</p>
                            {facture.client_adresse && <p className="text-gray-600">{facture.client_adresse}</p>}
                            {facture.client_telephone && <p className="text-gray-600">Tél: {facture.client_telephone}</p>}
                            {facture.client_email && <p className="text-gray-600">Email: {facture.client_email}</p>}
                            {facture.client_nif && <p className="text-gray-600">NIF: {facture.client_nif}</p>}
                        </div>
                    ) : (
                        <p className="text-sm italic text-gray-500">Vente au comptoir</p>
                    )}
                </div>

                {/* Line items table */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-300 text-left">
                                <th className="pb-2 font-semibold">Désignation</th>
                                <th className="pb-2 text-right font-semibold">Prix unitaire</th>
                                <th className="pb-2 text-center font-semibold">Quantité</th>
                                <th className="pb-2 text-right font-semibold">TVA (%)</th>
                                <th className="pb-2 text-right font-semibold">Sous-total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facture.lignes.map((ligne) => (
                                <tr key={ligne.id} className="border-b border-gray-100">
                                    <td className="py-2">{ligne.designation}</td>
                                    <td className="py-2 text-right">{fmt(ligne.prix_unitaire)} Ar</td>
                                    <td className="py-2 text-center">{ligne.quantite}</td>
                                    <td className="py-2 text-right">{ligne.taux_tva}%</td>
                                    <td className="py-2 text-right font-medium">{fmt(ligne.sous_total)} Ar</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-64 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total HT</span>
                            <span>{fmt(facture.montant_ht)} Ar</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">TVA</span>
                            <span>{fmt(facture.montant_tva)} Ar</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-gray-300 pt-2 text-base font-bold">
                            <span>Total TTC</span>
                            <span>{fmt(facture.montant_ttc)} Ar</span>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                {facture.note_pied_page && (
                    <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                        {facture.note_pied_page}
                    </div>
                )}
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    nav, aside, header, footer, [data-slot="sidebar"] { display: none !important; }
                }
            `}</style>
        </>
    );
}
