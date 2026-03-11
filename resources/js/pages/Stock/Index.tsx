import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import stocks from '@/routes/stocks';

interface Modele {
    name: string;
}

interface Variante {
    id_variante: number;
    reference_sku: string;
    modele: Modele;
    stock_reel: number;
    est_pack: boolean;
    stock_disponible: number;
}

interface PageProps {
    variantes: Variante[];
}

export default function Index() {
    const { variantes } = usePage().props as unknown as PageProps;
    const { data, setData, post, processing, reset } = useForm({
        id_variante: '',
        quantite: 0,
        type: 'inventaire',
        motif: '',
    });
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [selectedVariante, setSelectedVariante] = useState<Variante | null>(null);

    // Breadcrumbs pour la navigation
    const breadcrumbs = [
        { title: 'Dashboard', href: '/' },
        { title: 'Stock', href: stocks.index() },
    ];

    // Barre de recherche
    const [search, setSearch] = useState('');
    const variantesFiltered = useMemo(() => {
        if (!search) return variantes;
        const s = search.toLowerCase();
        return variantes.filter(v =>
            v.modele.name.toLowerCase().includes(s) ||
            v.reference_sku.toLowerCase().includes(s)
        );
    }, [search, variantes]);

    function stockBadge(variante: Variante) {
        const stock = variante.stock_disponible;
        if (stock <= 0) return <Badge variant="destructive">Rupture</Badge>;
        if (stock <= 5) return <Badge variant="destructive">{stock}</Badge>;
        return (
            <div className="flex items-center gap-2">
                <Badge variant="secondary">{stock}</Badge>
                {variante.est_pack && (
                    <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">
                        Pack
                    </span>
                )}
            </div>
        );
    }

    const voirHistorique = (idVariante: number) => {
        router.get('/stock/historique', { id_variante: idVariante });
    };

    const openAdjustDialog = (variante: Variante) => {
        setSelectedVariante(variante);
        setData('id_variante', variante.id_variante);
        setData('quantite', 0);
        setData('type', 'inventaire');
        setData('motif', '');
        setAdjustDialogOpen(true);
    };

    const addQuantity = (n: number) => setData('quantite', (data.quantite || 0) + n);
    const setQuantity = (n: number) => setData('quantite', n);

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(stocks.ajustement().url, {
            onSuccess: () => {
                reset();
                setAdjustDialogOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock" />
            <div className="p-4 space-y-4">
                <div className="flex gap-2">
                    <Link 
                        href={stocks.index()}
                        className={buttonVariants({ variant: 'default' })}
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
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Modifier
                    </Link>
                </div>

                {/* Barre de recherche */}
                <div className="max-w-md">
                    <Input
                        placeholder="Rechercher un produit ou une variante..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="mb-2"
                    />
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead>Variante</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="w-48 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variantesFiltered.length > 0 ? (
                                variantesFiltered.map((v) => (
                                    <TableRow key={v.id_variante} className="hover:bg-muted/50">
                                        <TableCell>{v.modele.name}</TableCell>
                                        <TableCell>{v.reference_sku}</TableCell>
                                        <TableCell>{stockBadge(v)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => voirHistorique(v.id_variante)}
                                            >
                                                Historique
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                onClick={() => openAdjustDialog(v)}
                                            >
                                                Ajuster
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Aucun produit trouvé
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajuter le stock</DialogTitle>
                            <DialogDescription>
                                {selectedVariante
                                    ? `Pour ${selectedVariante.modele.name} (${selectedVariante.reference_sku})`
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAdjustSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 font-medium">Quantité</label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="number"
                                        value={data.quantite}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                        className="w-28"
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
                                <label className="block mb-1 font-medium">Type de mouvement</label>
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

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setAdjustDialogOpen(false)}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing || !data.id_variante || !data.motif}>
                                    Enregistrer
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}