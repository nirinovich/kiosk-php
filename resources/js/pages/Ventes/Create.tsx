import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import ventes from '@/routes/ventes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductSearch, type Variante } from '@/components/product-search';
import { ClientSelect, type ClientOption } from '@/components/client-select';
import { LineItemsTable, type LigneItem } from '@/components/line-items-table';
import { OrderSummary } from '@/components/order-summary';
import { ShoppingCart, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Journal des ventes', href: ventes.index().url },
    { title: 'Nouvelle vente', href: ventes.create().url },
];

interface Props {
    variantes: Variante[];
    clients: ClientOption[];
}

export default function Create({ variantes, clients }: Props) {
    const [lignes, setLignes] = useState<LigneItem[]>([]);

    const { data, setData, post, processing, errors } = useForm<{
        id_client: number | null;
        lignes: {
            id_variante: number;
            quantite: number;
            prix_unitaire: number;
            taux_tva: number;
            remise_ligne: number;
        }[];
    }>({
        id_client: null,
        lignes: [],
    });

    function handleAddProduct(variante: Variante) {
        const existing = lignes.findIndex((l) => l.id_variante === variante.id_variante);
        let updated: LigneItem[];

        if (existing >= 0) {
            // Merge: add quantities for same variante
            updated = lignes.map((l, i) =>
                i === existing
                    ? { ...l, quantite: Math.min(l.quantite + 1, l.stock_reel) }
                    : l
            );
        } else {
            updated = [
                ...lignes,
                {
                    id_variante: variante.id_variante,
                    designation: variante.designation,
                    prix_unitaire: variante.prix_unitaire,
                    quantite: 1,
                    taux_tva: 20,
                    remise_ligne: 0,
                    stock_reel: variante.stock_reel,
                },
            ];
        }

        setLignes(updated);
        syncFormLignes(updated);
    }

    function handleUpdateQuantite(index: number, quantite: number) {
        const updated = lignes.map((l, i) =>
            i === index ? { ...l, quantite: Math.min(quantite, l.stock_reel) } : l
        );
        setLignes(updated);
        syncFormLignes(updated);
    }

    function handleRemoveLine(index: number) {
        const updated = lignes.filter((_, i) => i !== index);
        setLignes(updated);
        syncFormLignes(updated);
    }

    function syncFormLignes(items: LigneItem[]) {
        setData('lignes', items.map((l) => ({
            id_variante: l.id_variante,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
            taux_tva: l.taux_tva,
            remise_ligne: l.remise_ligne,
        })));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(ventes.store().url);
    }

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle vente" />

            <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6 p-4">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="text-primary size-6" />
                    <h1 className="text-2xl font-bold">Nouvelle vente</h1>
                </div>

                {hasErrors && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                            {Object.values(errors).flat().map((err, i) => (
                                <div key={i}>{err}</div>
                            ))}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left column: Product search + line items */}
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ajouter des produits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProductSearch
                                    variantes={variantes}
                                    onSelect={handleAddProduct}
                                    disabled={processing}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Lignes de commande</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LineItemsTable
                                    lignes={lignes}
                                    onUpdateQuantite={handleUpdateQuantite}
                                    onRemove={handleRemoveLine}
                                    disabled={processing}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column: Client + Summary */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Client</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Label className="sr-only">Sélectionner un client</Label>
                                <ClientSelect
                                    clients={clients}
                                    value={data.id_client}
                                    onChange={(clientId) => setData('id_client', clientId)}
                                    disabled={processing}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Récapitulatif</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <OrderSummary lignes={lignes} />
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={processing || lignes.length === 0}
                        >
                            {processing ? 'Enregistrement...' : 'Valider la vente'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
