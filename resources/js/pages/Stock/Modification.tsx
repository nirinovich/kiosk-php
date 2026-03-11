import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import stocks from '@/routes/stocks';

import React, { useState } from 'react';

interface Variante {
    id_variante: number;
    reference_sku: string;
    modele: { name: string };
}

interface PageProps {
    variantes: Variante[];
}

export default function Modification() {
    const { variantes } = usePage().props as unknown as PageProps;

    const breadcrumbs = [
        { title: 'Dashboard', href: '/' },
        { title: 'Stock', href: stocks.index() },
        { title: 'Modifier', href: stocks.modification() },
    ];

    const { data, setData, post, processing, reset } = useForm({
        id_variante: '',
        quantite: 0,
        type: 'inventaire',
        motif: '',
    });

    const [search, setSearch] = useState('');
    const variantesFiltered = React.useMemo(() => {
        if (!search) return variantes;
        const s = search.toLowerCase();
        return variantes.filter(v =>
            v.modele.name.toLowerCase().includes(s) ||
            v.reference_sku.toLowerCase().includes(s)
        );
    }, [search, variantes]);

    const addQuantity = (n: number) => setData('quantite', (data.quantite || 0) + n);
    const setQuantity = (n: number) => setData('quantite', n);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(stocks.ajustement().url, {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier le Stock" />
            <div className="p-4 space-y-4">
                <div className="flex gap-2">
                    <Link
                        href={stocks.index()}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Inventaire
                    </Link>
                    <Link
                        href={stocks.historique()}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Historique
                    </Link>
                    <Link
                        href={stocks.modification()}
                        className={buttonVariants({ variant: 'default' })}
                    >
                        Modifier
                    </Link>
                </div>
                <h2 className="text-lg font-semibold">Modification du stock</h2>

                <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
                    <div className="space-y-2">
                        <div className="max-w-md mb-2">
                            <Input
                                placeholder="Rechercher un produit ou une variante..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[360px] overflow-y-auto rounded-lg border bg-background">
                            {variantesFiltered.map((v) => (
                                <button
                                    key={v.id_variante}
                                    type="button"
                                    onClick={() => setData('id_variante', v.id_variante)}
                                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted ${
                                        String(data.id_variante) === String(v.id_variante)
                                            ? 'bg-muted font-medium'
                                            : ''
                                    }`}
                                >
                                    <span>{v.modele.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {v.reference_sku}
                                    </span>
                                </button>
                            ))}
                            {variantesFiltered.length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    Aucun produit trouvé
                                </div>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-3 max-w-md bg-muted/30 p-4 rounded-lg border"
                    >
                        <div>
                            <label className="block mb-1 text-sm font-medium">Produit sélectionné</label>
                            <div className="rounded border bg-background px-3 py-2 text-sm">
                                {(() => {
                                    const selected = variantes.find(
                                        v => String(v.id_variante) === String(data.id_variante),
                                    );
                                    return selected
                                        ? `${selected.modele.name} (${selected.reference_sku})`
                                        : 'Aucun produit sélectionné';
                                })()}
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Quantité</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="number"
                                    value={data.quantite}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="w-32"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={() => addQuantity(1)}>
                                    +1
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addQuantity(5)}>
                                    +5
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addQuantity(-1)}>
                                    -1
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addQuantity(-5)}>
                                    -5
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setQuantity(0)}>
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Type</label>
                            <select
                                className="border rounded px-2 py-1 w-full"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                            >
                                <option value="inventaire">Inventaire</option>
                                <option value="achat">Achat</option>
                                <option value="vente">Vente</option>
                                <option value="perte">Perte</option>
                                <option value="retour">Retour</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Motif</label>
                            <Input
                                type="text"
                                value={data.motif}
                                onChange={(e) => setData('motif', e.target.value)}
                                placeholder="Raison de l'ajustement"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={processing || !data.id_variante || !data.motif || !data.quantite}
                            className="w-full mt-2"
                        >
                            Modifier le Stock
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}