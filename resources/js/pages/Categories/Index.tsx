import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import categories from '@/routes/categories';
import products from '@/routes/products';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { InfoIcon, PlusIcon, SearchIcon, Tag, Pencil, Trash2, ArrowLeft } from 'lucide-react';

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

            <div className="p-4 space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Notification</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Table or empty state */}
                {cats.length > 0 ? (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-center">Produits</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cats.map((cat) => (
                                    <TableRow key={cat.id_categorie}>
                                        <TableCell className="font-medium">{cat.nom}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {cat.description || '—'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{cat.produits_count}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link href={categories.edit(cat.id_categorie).url}>
                                                    <Button variant="ghost" size="icon" title="Modifier">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={processing}
                                                    onClick={() => handleDelete(cat.id_categorie, cat.nom)}
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
        </AppLayout>
    );
}
