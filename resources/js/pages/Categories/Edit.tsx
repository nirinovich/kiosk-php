import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import categories from '@/routes/categories';
import products from '@/routes/products';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import { FormErrors } from '@/components/form-errors';

interface Categorie {
    id_categorie: number;
    nom: string;
    description: string | null;
}

interface Props {
    categorie: Categorie;
}

export default function Edit({ categorie }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Produits', href: products.index().url },
        { title: 'Catégories', href: categories.index().url },
        { title: `Modifier "${categorie.nom}"`, href: categories.edit(categorie.id_categorie).url },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nom: categorie.nom,
        description: categorie.description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(categories.update(categorie.id_categorie).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier — ${categorie.nom}`} />

            <div className="max-w-xl mx-auto p-4 space-y-6">
                <FormErrors errors={errors} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Modifier la catégorie
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="nom">Nom *</Label>
                                <Input
                                    id="nom"
                                    placeholder="Ex : Électronique, Vêtements..."
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="mt-1"
                                    autoFocus
                                />
                                {errors.nom && <p className="text-xs text-destructive mt-1">{errors.nom}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Description de la catégorie (optionnel)"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => window.history.back()}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? 'Enregistrement...' : 'Mettre à jour'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
