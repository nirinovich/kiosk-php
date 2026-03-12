import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, Package, Layers, PackagePlus, Tags } from 'lucide-react';
import products from '@/routes/products';
import { dashboard } from '@/routes';
import { useState, useEffect } from 'react';
import { CategoryCombobox } from '@/components/category-combobox';
import { VariantCard, type VarianteFormData } from '@/components/variant-card';
import { FormErrors } from '@/components/form-errors';
import { ImageUpload } from '@/components/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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
    est_pack?: boolean;
    composants?: any[];
}

interface ProduitModele {
    id_modele: number;
    name: string;
    prix_standard: number;
    description: string;
    image_url: string | null;
    id_categorie: number;
    unite_mesure: string;
    is_ingredient: boolean;
    variantes: VarianteDepuisBDD[];
}

interface Props {
    produit_modele: ProduitModele;
    attributs: Attribut[];
    categories: Categorie[];
    isSimpleProduct: boolean;
    currentStock: number;
    availableVariantes: VarianteFormData[];
}

export default function Edit({ produit_modele, attributs, categories: initialCategories, isSimpleProduct, currentStock, availableVariantes }: Props) {
    const [categories, setCategories] = useState<Categorie[]>(initialCategories);
    const [variantesDispo, setVariantesDispo] = useState<VarianteFormData[]>(availableVariantes || []);
    const [savedCategoryBeforeIngredient, setSavedCategoryBeforeIngredient] = useState<number | string>(produit_modele.id_categorie || '');

    // Find the "Ingrédients" category
    const ingredientCategory = categories.find(c => c.nom === 'Ingrédients');

    // Determine initial type based on DB data
    const isPackOnly = !isSimpleProduct && produit_modele.variantes?.length === 1 && produit_modele.variantes[0].est_pack;
    const initialProductType = isSimpleProduct ? 'simple' : (isPackOnly ? 'pack' : 'variable');

    const [productType, setProductType] = useState<'simple' | 'variable' | 'pack'>(initialProductType);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Produits', href: products.index().url },
        { title: `Modifier "${produit_modele.name}"`, href: products.edit(produit_modele.id_modele).url },
    ];

    const initialVariantes: VarianteFormData[] = isSimpleProduct
        ? []
        : produit_modele.variantes?.map((v: any) => ({
            id_variante: v.id_variante,
            sku: v.reference_sku || '',
            surcout: Number(v.surcout_prix) || 0,
            stock_reel: Number(v.stock_reel) || 0,
            valeurs_ids: v.valeurs.map((val: any) => val.id_valeur),
            valeurs_custom: [],
            est_pack: v.est_pack,
            composants: v.composants || []
        })) ?? [];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT' as const,
        name: produit_modele.name,
        prix_standard: produit_modele.prix_standard,
        description: produit_modele.description || '',
        image_url: null as File | null,
        remove_image: false,
        id_categorie: produit_modele.id_categorie || ('' as number | string),
        unite_mesure: produit_modele.unite_mesure || 'unité',
        is_ingredient: produit_modele.is_ingredient || false,
        is_simple: isSimpleProduct,
        stock_initial: currentStock,
        variantes: initialVariantes,
    });

    const emptyPack: VarianteFormData = {
        sku: '', surcout: 0, stock_reel: 0, valeurs_ids: [], valeurs_custom: [], est_pack: true, composants: [{ id_variante: '', quantite: 1 }, { id_variante: '', quantite: 1 }]
    };

    const handleProductTypeChange = (type: 'simple' | 'variable' | 'pack') => {
        setProductType(type);
        if (type === 'simple') {
            setData((prev) => ({ ...prev, is_simple: true, variantes: [], stock_initial: currentStock || 0 }));
        } else if (type === 'variable') {
            setData((prev) => ({
                ...prev,
                is_simple: false,
                is_ingredient: false, // Variable products cannot be ingredients
                variantes: prev.variantes.length > 0 && !prev.variantes[0].est_pack
                    ? prev.variantes
                    : [{ sku: '', surcout: 0, stock_reel: 0, valeurs_ids: [], valeurs_custom: [], est_pack: false, composants: [] }]
            }));
        } else if (type === 'pack') {
            setData((prev) => {
                const variants = [...prev.variantes];
                if (variants.length === 0) {
                    return { ...prev, is_simple: false, is_ingredient: false, unite_mesure: 'unité', variantes: [{ ...emptyPack }] };
                } else {
                    variants[0] = { ...variants[0], est_pack: true };
                    if (!variants[0].composants || variants[0].composants.length < 2) {
                        variants[0].composants = [{ id_variante: '', quantite: 1 }, { id_variante: '', quantite: 1 }];
                    }
                    return { ...prev, is_simple: false, is_ingredient: false, unite_mesure: 'unité', variantes: variants };
                }
            });
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
            setProductType('simple');
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

        // Add validation for pack mode
        if (productType === 'pack') {
            const variant = data.variantes[0];
            if (!variant.composants || variant.composants.length < 2) {
                alert("Un pack doit contenir au moins 2 ingrédients.");
                return;
            }
            // Check that they actually selected items
            const hasEmpty = variant.composants.some(c => !c.id_variante);
            if (hasEmpty) {
                alert("Veuillez sélectionner un produit valide pour chaque composant du pack.");
                return;
            }
        }

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
                    {/* ── Type Display (Locked during edit) ── */}
                    <div className="mb-6 w-full">
                        {productType === 'simple' && (
                            <div className="rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center border-primary bg-primary/5 shadow-sm">
                                <Package className="h-8 w-8 mb-2 text-primary" />
                                <h3 className="font-semibold text-foreground">Produit Simple</h3>
                                <p className="text-xs mt-1">Un produit classique avec un stock unique.</p>
                            </div>
                        )}
                        {productType === 'variable' && (
                            <div className="rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center border-primary bg-primary/5 shadow-sm">
                                <Tags className="h-8 w-8 mb-2 text-primary" />
                                <h3 className="font-semibold text-foreground">Avec Déclinaisons</h3>
                                <p className="text-xs mt-1">Différentes tailles, couleurs ou options.</p>
                            </div>
                        )}
                        {productType === 'pack' && (
                            <div className="rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center border-primary bg-primary/5 shadow-sm">
                                <PackagePlus className="h-8 w-8 mb-2 text-primary" />
                                <h3 className="font-semibold text-foreground">Pack / Recette</h3>
                                <p className="text-xs mt-1">Un ensemble composé d'autres produits.</p>
                            </div>
                        )}
                    </div>

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
                                        {data.is_ingredient ? (
                                            <>
                                                <Label>Catégorie</Label>
                                                <Input
                                                    value="Ingrédients"
                                                    disabled
                                                    className="mt-1 bg-muted"
                                                />
                                            </>
                                        ) : (
                                            <CategoryCombobox
                                                categories={categories}
                                                value={data.id_categorie}
                                                onChange={(v) => setData('id_categorie', v)}
                                                onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="unite_mesure">Unité de mesure *</Label>
                                        <Select onValueChange={(v) => setData('unite_mesure', v)} defaultValue={data.unite_mesure}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Sélectionnez l'unité" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unité">Unité</SelectItem>
                                                <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                                                <SelectItem value="gramme">Gramme (g)</SelectItem>
                                                <SelectItem value="litre">Litre (L)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.unite_mesure && <p className="text-xs text-destructive mt-1">{errors.unite_mesure}</p>}
                                    </div>
                                    
                                    {productType === 'simple' && (
                                        <div className="flex items-center space-x-3 pt-8">
                                            <Switch
                                                id="is_ingredient"
                                                checked={data.is_ingredient}
                                                onCheckedChange={(checked) => {
                                                    setData('is_ingredient', checked);
                                                    if (checked && ingredientCategory) {
                                                        setSavedCategoryBeforeIngredient(data.id_categorie);
                                                        setData('id_categorie', ingredientCategory.id_categorie);
                                                    } else if (!checked) {
                                                        setData('id_categorie', savedCategoryBeforeIngredient);
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="is_ingredient" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                                C'est un ingrédient
                                            </Label>
                                        </div>
                                    )}
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
                                    {productType === 'simple' ? <Package className="h-5 w-5" /> : productType === 'pack' ? <PackagePlus className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                                    {productType === 'simple' ? 'Gestion du stock initial' : productType === 'pack' ? 'Composition du pack' : 'Stock & Déclinaisons'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {/* Simple mode */}
                                {productType === 'simple' && (
                                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                                        <div className="mb-4">
                                            <p className="text-sm font-medium">Stock actuel</p>
                                            <p className="text-xs text-muted-foreground">Modifier la réserve enregistrée.</p>
                                        </div>
                                        <Label htmlFor="stock_initial">Stock actuel</Label>
                                        <Input
                                            id="stock_initial"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            value={data.stock_initial}
                                            onChange={(e) => setData('stock_initial', Number(e.target.value))}
                                            className="mt-1 max-w-xs bg-background"
                                            disabled
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">Le stock doit être géré depuis la section Stock &gt; Ajustement ou Mouvements.</p>
                                    </div>
                                )}

                                {/* Variant mode */}
                                {productType !== 'simple' && (
                                    <div className="space-y-4">
                                        {data.variantes.map((variante, index) => (
                                            <VariantCard
                                                key={index}
                                                index={index}
                                                variante={variante}
                                                attributs={attributs}
                                                availableVariantes={variantesDispo}
                                                categories={categories}
                                                isPackMode={productType === 'pack'}
                                                onUpdate={updateVariante}
                                                onDelete={supprimerVariante}
                                                onToggleValeur={toggleValeur}
                                                onAddCustomAttr={addCustomAttr}
                                                onIngredientCreated={(newIng: VarianteFormData) => setVariantesDispo(prev => [...prev, newIng])}
                                            />
                                        ))}

                                        {productType === 'variable' && (
                                            <button
                                                type="button"
                                                onClick={ajouterVariante}
                                                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-4 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                                Ajouter une variante
                                            </button>
                                        )}
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
