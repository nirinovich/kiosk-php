import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { InfoIcon, PlusIcon, SearchIcon, Tag, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import categories from '@/routes/categories';
import products from '@/routes/products';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Produits', href: products.index().url },
    { title: 'Catégories', href: categories.index().url },
];

interface Categorie {
    id_categorie: number;
    nom: string;
    description: string | null;
    produits_count: number;
}

interface PageProps {
    flash: { message?: string };
    categories: Categorie[];
    filters: { search?: string };
}

// Curated color palette for category cards
const CATEGORY_COLORS = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
    '#84CC16', // lime
];

function getCategoryColor(index: number): string {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export default function Index() {
    const { categories: cats, flash, filters } = usePage().props as unknown as PageProps;
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, nom: string) => {
        if (confirm(`Supprimer la catégorie « ${nom} » ? Les produits associés ne seront pas supprimés.`)) {
            destroy(categories.destroy(id).url);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(categories.index().url, { search: e.target.value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catégories" />

            <div className="p-6 space-y-6">
                {/* Page header */}
                <h1 className="text-2xl font-bold tracking-tight">Gestion des Catégories</h1>

                {/* Toolbar */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                        <div className="relative w-full sm:w-80">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une catégorie..."
                                defaultValue={filters.search}
                                onChange={handleSearch}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={products.index().url}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Retour aux produits
                                </Button>
                            </Link>
                            <Link href={categories.create().url}>
                                <Button>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Nouvelle catégorie
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Flash message */}
                    {flash.message && (
                        <div className="mb-6">
                            <Alert>
                                <InfoIcon className="h-4 w-4" />
                                <AlertTitle>Notification</AlertTitle>
                                <AlertDescription>{flash.message}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Card grid or empty state */}
                    {cats.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cats.map((cat, index) => {
                                const color = getCategoryColor(index);
                                return (
                                    <div
                                        key={cat.id_categorie}
                                        className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    <Tag className="text-white" size={24} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-lg truncate">{cat.nom}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {cat.produits_count} produit{cat.produits_count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {cat.description && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {cat.description}
                                            </p>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <Link href={categories.edit(cat.id_categorie).url} className="flex-1">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    <Pencil size={16} className="mr-1" />
                                                    Modifier
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={processing}
                                                onClick={() => handleDelete(cat.id_categorie, cat.nom)}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Aucune catégorie</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">
                                Organisez vos produits en créant des catégories.
                            </p>
                            <Link href={categories.create().url}>
                                <Button>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Créer une catégorie
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
