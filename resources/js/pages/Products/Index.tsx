import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import products from '@/routes/products';
import { dashboard } from '@/routes';
import categories from '@/routes/categories';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { InfoIcon, PlusIcon, SearchIcon, PackageOpen, Pencil, Trash2, Tag, Layers, PackagePlus } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Produits', href: products.index().url },
];

interface Categorie {
    id_categorie: number;
    nom: string;
}

interface ProduitModele {
    id_modele: number;
    name: string;
    prix_standard: number;
    image_url: string | null;
    description: string;
    categorie: Categorie | null;
    variantes_count: number;
    variantes_sum_stock_reel: number | null;
}

interface PageProps {
    flash: { message?: string };
    produit_modele: ProduitModele[];
    filters: { search?: string };
}

function formatMoney(amount: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'decimal', minimumFractionDigits: 0 }).format(amount) + ' MGA';
}

function stockBadge(stock: number | null) {
    const total = stock ?? 0;
    if (total === 0) return <Badge variant="destructive">Rupture</Badge>;
    if (total <= 5) return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">{total}</Badge>;
    return <Badge className="bg-green-600 hover:bg-green-700 text-white">{total}</Badge>;
}

export default function Index() {
    const { produit_modele, flash, filters } = usePage().props as unknown as PageProps;
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Supprimer le produit « ${name} » ? Cette action est irréversible.`)) {
            destroy(`/products/${id}`);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(products.index().url, { search: e.target.value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produits" />

            <div className="p-4 space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un produit ou catégorie..."
                            defaultValue={filters.search}
                            onChange={handleSearch}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={categories.index().url}>
                            <Button variant="outline" className="hidden sm:flex">
                                <Tag className="h-4 w-4 mr-2" />
                                Catégories
                            </Button>
                        </Link>
                        <Link href={`${products.create().url}?type=pack`}>
                            <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-primary/20 border">
                                <PackagePlus className="h-4 w-4 mr-2" />
                                Créer un pack
                            </Button>
                        </Link>
                        <Link href={products.create().url}>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nouveau produit
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Flash message */}
                {flash.message && (
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Notification</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Product table or empty state */}
                {produit_modele.length > 0 ? (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">Image</TableHead>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead className="text-right">Prix</TableHead>
                                    <TableHead className="text-center">Stock</TableHead>
                                    <TableHead className="text-center">Variantes</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {produit_modele.map((p) => (
                                    <TableRow key={p.id_modele}>
                                        <TableCell>
                                            {p.image_url ? (
                                                <img src={`/${p.image_url}`} alt={p.name} className="w-10 h-10 object-cover rounded" />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                    <PackageOpen className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{p.categorie?.nom ?? '—'}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatMoney(p.prix_standard)}</TableCell>
                                        <TableCell className="text-center">{stockBadge(p.variantes_sum_stock_reel)}</TableCell>
                                        <TableCell className="text-center">
                                            {p.variantes_count <= 1 ? (
                                                <span className="text-xs text-muted-foreground">Simple</span>
                                            ) : (
                                                <Badge variant="secondary">{p.variantes_count}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link href={products.edit(p.id_modele).url}>
                                                    <Button variant="ghost" size="icon" title="Modifier">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={processing}
                                                    onClick={() => handleDelete(p.id_modele, p.name)}
                                                    title="Supprimer"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Aucun produit</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Commencez par créer votre premier produit.
                        </p>
                        <Link href={products.create()}>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Créer votre premier produit
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
