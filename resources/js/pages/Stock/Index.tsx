import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { PackageOpen, AlertTriangle, TrendingUp, TrendingDown, Package, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import stocks from '@/routes/stocks';

interface Modele {
    name: string;
    image_url: string | null;
    unite_mesure: string | null;
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
        { title: 'Stock', href: stocks.index().url },
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
        const unite = variante.modele.unite_mesure ? ` ${variante.modele.unite_mesure}` : '';
        const displayStock = `${stock}${unite}`;

        if (stock <= 0) return <Badge variant="destructive">{displayStock} (Rupture)</Badge>;
        if (stock <= 5) return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">{displayStock}</Badge>;
        
        return (
            <div className="flex items-center gap-2">
                <Badge className="bg-green-600 hover:bg-green-700 text-white">{displayStock}</Badge>
                {Boolean(variante.est_pack) && (
                    <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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
        setData('id_variante', variante.id_variante.toString());
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

    const criticalProducts = variantes.filter(v => v.stock_disponible <= 5);
    const normalProducts = variantes.filter(v => v.stock_disponible > 5 && v.stock_disponible < 50);
    const highProducts = variantes.filter(v => v.stock_disponible >= 50);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock" />
            <div className="p-4 md:p-8 space-y-6">

                {/* En-tête + Boutons */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Stocks</h1>
                    
                    <div className="flex flex-wrap gap-2">
                        <Link 
                            href={stocks.index().url}
                            className={buttonVariants({ variant: 'default' })}
                        >
                            Inventaire
                        </Link>
                        <Link 
                            href={stocks.historique().url}
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            Historique Mouvements
                        </Link>
                        <Link 
                            href={stocks.modification().url}
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            Modifier
                        </Link>
                    </div>
                </div>

                {/* Dashboard / Statistiques */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-card border rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-muted-foreground flex justify-between items-center mb-2">Total produits <Package className="size-4 opacity-50" /></p>
                        <p className="text-3xl font-bold">{variantes.length}</p>
                    </div>
                    <div className="p-5 bg-card border border-red-200 dark:border-red-900 shadow-sm rounded-lg">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 flex justify-between items-center mb-2">Stock critique <AlertTriangle className="size-4 opacity-70" /></p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                            {criticalProducts.length}
                        </p>
                    </div>
                    <div className="p-5 bg-card border shadow-sm rounded-lg">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex justify-between items-center mb-2">Stock normal <TrendingDown className="size-4 opacity-50" /></p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {normalProducts.length}
                        </p>
                    </div>
                    <div className="p-5 bg-card border shadow-sm rounded-lg">
                        <p className="text-sm font-medium text-green-600 dark:text-green-500 flex justify-between items-center mb-2">Stock élevé <TrendingUp className="size-4 opacity-50" /></p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                            {highProducts.length}
                        </p>
                    </div>
                </div>

                {/* Alertes critiques */}
                {criticalProducts.length > 0 && (
                    <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="text-red-600 dark:text-red-500" size={24} />
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-400">
                                Action requise : {criticalProducts.length} produit(s) en rupture ou stock critique !
                            </h3>
                        </div>
                        <ul className="list-disc list-inside text-red-700 dark:text-red-400/80 text-sm grid sm:grid-cols-2 md:grid-cols-3 gap-1">
                            {criticalProducts.map(p => (
                                <li key={p.id_variante} className="truncate" title={`${p.modele.name} (${p.reference_sku})`}>
                                    <span className="font-semibold">{p.modele.name}</span> - {p.stock_disponible}{p.modele.unite_mesure ? ` ${p.modele.unite_mesure}` : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Barre de recherche */}
                <div className="max-w-md">
                    <Input
                        placeholder="Rechercher un produit ou une variante..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="rounded-lg border shadow-sm bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-16">Image</TableHead>
                                <TableHead className="font-semibold">Produit</TableHead>
                                <TableHead className="font-semibold">Variante</TableHead>
                                <TableHead className="font-semibold">Stock</TableHead>
                                <TableHead className="w-56 text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variantesFiltered.length > 0 ? (
                                variantesFiltered.map((v) => (
                                    <TableRow key={v.id_variante} className="hover:bg-muted/50">
                                        <TableCell>
                                            {v.modele.image_url ? (
                                                <img 
                                                    src={v.modele.image_url.startsWith('http') ? v.modele.image_url : `/${v.modele.image_url}`} 
                                                    alt={v.modele.name} 
                                                    className="w-10 h-10 object-cover rounded shadow-sm border" 
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-muted border border-border/50 flex items-center justify-center">
                                                    <PackageOpen className="h-4 w-4 text-muted-foreground/60" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">{v.modele.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{v.reference_sku}</TableCell>
                                        <TableCell>{stockBadge(v)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="shadow-none border-border/80 text-muted-foreground hover:text-foreground"
                                                onClick={() => voirHistorique(v.id_variante)}
                                            >
                                                Historique
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                className="gap-1.5 shadow-none"
                                                onClick={() => openAdjustDialog(v)}
                                            >
                                                Ajuster
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
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