import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import products from '@/routes/products';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, Package, Layers } from 'lucide-react';
import { useState } from 'react';
import { CategoryCombobox } from '@/components/category-combobox';
import { VariantCard, type VarianteFormData } from '@/components/variant-card';
import { FormErrors } from '@/components/form-errors';
import { ImageUpload } from '@/components/image-upload';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Produits', href: products.index().url },
    { title: 'Nouveau produit', href: products.create().url },
];

interface Categorie {
    id_categorie: number;
    nom: string;
}

interface Valeur {
    id_valeur: number;
    nom_valeur: string;
}

interface Attribut {
    id_attribut: number;
    nom: string;
    nom_attribut?: string;
    valeurs: Valeur[];
}

interface DisponibleVariante {
    id_variante: number;
    sku: string;
}

interface Props {
    attributs: Attribut[];
    categories: Categorie[];
    availableVariantes: DisponibleVariante[];
}

interface FormState {
    name: string;
    prix_standard: string | number;
    description: string;
    stock_initial: number;
    image_url: File | null;
    id_categorie: number | string;
    variantes: VarianteFormData[];
}

export default function Create({ attributs, categories: initialCategories, availableVariantes }: Props) {

    console.log("Ce que Laravel envoie :", availableVariantes);
    
    const [categories, setCategories] = useState<Categorie[]>(initialCategories);
    const [hasVariants, setHasVariants] = useState(false);

    const { data, setData, post, processing, errors } = useForm<FormState>({
        name: '',
        prix_standard: '',
        description: '',
        stock_initial: 0,
        image_url: null,
        id_categorie: '',
        variantes: [],
    });

    const emptyVariant: VarianteFormData = { 
        sku: '', 
        surcout: 0, 
        stock_reel: 0, 
        valeurs_ids: [], 
        valeurs_custom: [],
        est_pack: false,
        composants: []
    };

    const toggleVariantMode = () => {
        if (hasVariants) {
            // Switching back to simple — clear variants
            setData('variantes', []);
            setHasVariants(false);
        } else {
            // Switching to variant mode — add one empty variant
            setData('variantes', [emptyVariant]);
            setHasVariants(true);
        }
    };

    const ajouterVariante = () => {
        setData('variantes', [
            ...data.variantes,
            emptyVariant
        ]);
    };

    const supprimerVariante = (index: number) => {
        const updated = data.variantes.filter((_, i) => i !== index);
        if (updated.length === 0) {
            setHasVariants(false);
        }
        setData('variantes', updated);
    };

    const updateVariante = (index: number, field: keyof VarianteFormData, value: any) => {
        const updated = [...data.variantes];
        (updated[index] as any)[field] = value;
        setData('variantes', updated);
    };

    const toggleValeur = (indexVariante: number, idValeur: number) => {
        const updated = [...data.variantes];
        const ids = updated[indexVariante].valeurs_ids;
        updated[indexVariante].valeurs_ids = ids.includes(idValeur)
            ? ids.filter((id) => id !== idValeur)
            : [...ids, idValeur];
        setData('variantes', updated);
    };

    const addCustomAttr = (indexVariante: number, attribut: string, valeur: string) => {
        const updated = [...data.variantes];
        updated[indexVariante].valeurs_custom.push({ attribut, valeur });
        setData('variantes', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(products.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau produit" />
            <div className="max-w-3xl mx-auto p-4 space-y-6">
                <FormErrors errors={errors} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── Section 1: Product Info ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Informations du produit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nom du produit *</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex : T-Shirt classique"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="prix_standard">Prix standard (HT) *</Label>
                                    <Input
                                        id="prix_standard"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={data.prix_standard}
                                        onChange={(e) => setData('prix_standard', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.prix_standard && <p className="text-xs text-destructive mt-1">{errors.prix_standard}</p>}
                                </div>
                                <div>
                                    <CategoryCombobox
                                        categories={categories}
                                        value={data.id_categorie}
                                        onChange={(v) => setData('id_categorie', v)}
                                        onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Description du produit (optionnel)"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Image du produit</Label>
                                <ImageUpload
                                    value={data.image_url}
                                    onChange={(file) => setData('image_url', file)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Section 2: Stock & Variants ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Stock & Déclinaisons ou Packs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Mode toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        {hasVariants ? 'Produit avec déclinaisons / Packs' : 'Produit simple'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {hasVariants
                                            ? 'Chaque variante a son propre stock (tailles, couleurs...)'
                                            : 'Un seul article avec un stock global'}
                                    </p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={toggleVariantMode}>
                                    {hasVariants ? 'Passer en simple' : 'Ajouter des déclinaisons'}
                                </Button>
                            </div>

                            {/* Simple mode: single stock input */}
                            {!hasVariants && (
                                <div>
                                    <Label htmlFor="stock_initial">Stock initial</Label>
                                    <Input
                                        id="stock_initial"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        value={data.stock_initial}
                                        onChange={(e) => setData('stock_initial', Number(e.target.value))}
                                        className="mt-1 max-w-xs"
                                    />
                                </div>
                            )}

                            {/* Variant mode: variant cards */}
                            {hasVariants && (
                                <div className="space-y-4">
                                    {data.variantes.map((variante, index) => (
                                        <VariantCard
                                            key={index}
                                            index={index}
                                            variante={variante}
                                            attributs={attributs}
                                            availableVariantes={availableVariantes}
                                            onUpdate={updateVariante}
                                            onDelete={supprimerVariante}
                                            onToggleValeur={toggleValeur}
                                            onAddCustomAttr={addCustomAttr}
                                        />
                                    ))}

                                    <button
                                        type="button"
                                        onClick={ajouterVariante}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-4 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Ajouter une variante ou Pack
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <Button disabled={processing} type="submit" className="w-full">
                        {processing ? 'Enregistrement...' : 'Enregistrer le produit'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
