import { Head, useForm } from '@inertiajs/react';
import { Tag } from 'lucide-react';
import { FormErrors } from '@/components/form-errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import categories from '@/routes/categories';
import products from '@/routes/products';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Produits', href: products.index().url },
    { title: 'Catégories', href: categories.index().url },
    { title: 'Nouvelle catégorie', href: categories.create().url },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(categories.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle catégorie" />

            <div className="max-w-xl mx-auto p-4 space-y-6">
                <FormErrors errors={errors} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Nouvelle catégorie
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
                            {processing ? 'Création...' : 'Créer la catégorie'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
