import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, Package, Layers } from 'lucide-react';
import products from '@/routes/products';
import { dashboard } from '@/routes';
import { useState } from 'react';
import { CategoryCombobox } from '@/components/category-combobox';
import { VariantCard, type VarianteFormData } from '@/components/variant-card';
import { FormErrors } from '@/components/form-errors';
import { ImageUpload } from '@/components/image-upload';

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

interface Categorie {
    id_categorie: number;
    nom: string;
}

interface VarianteDepuisBDD {
    id_variante: number;
    reference_sku: string;
    surcout_prix: number;
    stock_reel: number;
    valeurs: Valeur[];
}

interface ProduitModele {
    id_modele: number;
    name: string;
    prix_standard: number;
    description: string;
    image_url: string | null;
    id_categorie: number;
    variantes: VarianteDepuisBDD[];
}

interface Props {
    produit_modele: ProduitModele;
    attributs: Attribut[];
    categories: Categorie[];
    isSimpleProduct: boolean;
    currentStock: number;
}

export default function Edit({ produit_modele, attributs, categories: initialCategories, isSimpleProduct, currentStock }: Props) {
    const [categories, setCategories] = useState<Categorie[]>(initialCategories);
    const [hasVariants, setHasVariants] = useState(!isSimpleProduct);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Produits', href: products.index().url },
        { title: `Modifier "${produit_modele.name}"`, href: products.edit(produit_modele.id_modele).url },
    ];

    const initialVariantes: VarianteFormData[] = isSimpleProduct
        ? []
        : produit_modele.variantes?.map((v) => ({
              id_variante: v.id_variante,
              sku: v.reference_sku || '',
              surcout: Number(v.surcout_prix) || 0,
              stock_reel: Number(v.stock_reel) || 0,
              valeurs_ids: v.valeurs.map((val) => val.id_valeur),
              valeurs_custom: [],
          })) ?? [];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT' as const,
        name: produit_modele.name,
        prix_standard: produit_modele.prix_standard,
        description: produit_modele.description || '',
        image_url: null as File | null,
        remove_image: false,
        id_categorie: produit_modele.id_categorie || ('' as number | string),
        is_simple: isSimpleProduct,
        stock_initial: currentStock,
        variantes: initialVariantes,
    });

    const toggleVariantMode = () => {
        if (hasVariants) {
            setData((prev) => ({
                ...prev,
                is_simple: true,
                variantes: [],
                stock_initial: 0,
            }));
            setHasVariants(false);
        } else {
            setData((prev) => ({
                ...prev,
                is_simple: false,
                variantes: [{ sku: '', surcout: 0, stock_reel: 0, valeurs_ids: [], valeurs_custom: [] }],
            }));
            setHasVariants(true);
        }
    };

    const ajouterVariante = () => {
        setData('variantes', [
            ...data.variantes,
            { sku: '', surcout: 0, stock_reel: 0, valeurs_ids: [], valeurs_custom: [] },
        ]);
    };

    const supprimerVariante = (index: number) => {
        const updated = data.variantes.filter((_, i) => i !== index);
        if (updated.length === 0) {
            setHasVariants(false);
            setData((prev) => ({ ...prev, is_simple: true, variantes: [], stock_initial: 0 }));
            return;
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

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(products.update(produit_modele.id_modele).url, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier — ${produit_modele.name}`} />
            <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
                <FormErrors errors={errors} />

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
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
                                            onChange={(e) => setData('prix_standard', Number(e.target.value))}
                                            className="mt-1"
                                        />
                                        {errors.prix_standard && (
                                            <p className="text-xs text-destructive mt-1">{errors.prix_standard}</p>
                                        )}
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
                                        currentImageUrl={produit_modele.image_url}
                                        removeCurrent={data.remove_image}
                                        onChange={(file) => setData('image_url', file)}
                                        onRemoveCurrentChange={(remove) => setData('remove_image', remove)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── Section 2: Stock & Variants ── */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="h-5 w-5" />
                                    Stock & Déclinaisons
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Mode toggle */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {hasVariants ? 'Produit avec déclinaisons' : 'Produit simple'}
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

                                {/* Simple mode */}
                                {!hasVariants && (
                                    <div>
                                        <Label htmlFor="stock_initial">Stock actuel</Label>
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

                                {/* Variant mode */}
                                {hasVariants && (
                                    <div className="space-y-4">
                                        {data.variantes.map((variante, index) => (
                                            <VariantCard
                                                key={variante.id_variante ?? `new-${index}`}
                                                index={index}
                                                variante={variante}
                                                attributs={attributs}
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
                                            Ajouter une variante
                                        </button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submit */}
                    <Button disabled={processing} type="submit" className="w-full">
                        {processing ? 'Enregistrement...' : 'Mettre à jour le produit'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
