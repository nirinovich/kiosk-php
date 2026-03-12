import { Head, useForm } from '@inertiajs/react';
import { PlusIcon, Package, Layers, PackagePlus, Tags } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CategoryCombobox } from '@/components/category-combobox';
import { FormErrors } from '@/components/form-errors';
import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { VariantCard, type VarianteFormData } from '@/components/variant-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import products from '@/routes/products';
import type { BreadcrumbItem } from '@/types';

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

interface Props {
    attributs: Attribut[];
    categories: Categorie[];
    availableVariantes: VarianteFormData[];
}

interface FormState {
    name: string;
    prix_standard: string | number;
    description: string;
    stock_initial: number;
    image_url: File | null;
    id_categorie: number | string;
    unite_mesure: string;
    is_ingredient: boolean;
    variantes: VarianteFormData[];
}

export default function Create({ attributs, categories: initialCategories, availableVariantes }: Props) {

    // Support initial type from URL
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const initialTypeParam = searchParams.get('type');

    const [categories, setCategories] = useState<Categorie[]>(initialCategories);
    const [variantesDispo, setVariantesDispo] = useState<VarianteFormData[]>(availableVariantes || []);
    const [productType, setProductType] = useState<'simple' | 'variable' | 'pack'>(initialTypeParam === 'pack' ? 'pack' : 'simple');
    const [savedCategoryBeforeIngredient, setSavedCategoryBeforeIngredient] = useState<number | string>('');

    // Find the "Ingrédients" category
    const ingredientCategory = categories.find(c => c.nom === 'Ingrédients');

    // Create a robust empty variant template
    const emptyVariant: VarianteFormData = {
        sku: '',
        surcout: 0,
        stock_reel: 0,
        valeurs_ids: [],
        valeurs_custom: [],
        est_pack: false,
        composants: []
    };

    const emptyPack: VarianteFormData = {
        ...emptyVariant,
        est_pack: true,
        composants: [{ id_variante: '', quantite: 1 }, { id_variante: '', quantite: 1 }]
    };

    const { data, setData, post, processing, errors } = useForm<FormState>({
        name: '',
        prix_standard: '',
        description: '',
        stock_initial: 0,
        image_url: null,
        id_categorie: '',
        unite_mesure: 'unité',
        is_ingredient: false,
        // Initialize based on URL param
        variantes: initialTypeParam === 'pack' ? [emptyPack] : [],
    });

    // Remove duplicated emptyVariant

    const handleProductTypeChange = (type: 'simple' | 'variable' | 'pack') => {
        setProductType(type);
        if (type === 'simple') {
            setData('variantes', []);
        } else if (type === 'variable') {
            setData('is_ingredient', false); // Variable products cannot be ingredients
            // If we already have variants (and not just a pack), keep them. Otherwise set one empty variant
            if (data.variantes.length === 0 || data.variantes[0].est_pack) {
                setData('variantes', [{ ...emptyVariant }]);
            }
        } else if (type === 'pack') {
            setData('is_ingredient', false); // Packs cannot be ingredients
            setData('unite_mesure', 'unité'); // Packs must use unité
            // Force the first variant to be a pack
            if (data.variantes.length === 0) {
                setData('variantes', [{ ...emptyPack }]);
            } else {
                const updated = [...data.variantes];
                updated[0] = { ...updated[0], est_pack: true };
                if (!updated[0].composants || updated[0].composants.length < 2) {
                    updated[0].composants = [{ id_variante: '', quantite: 1 }, { id_variante: '', quantite: 1 }];
                }
                setData('variantes', updated);
            }
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
            setProductType('simple');
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

        post(products.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau produit" />
            <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
                <FormErrors errors={errors} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── Type selector (Visual upgrade) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div
                            onClick={() => handleProductTypeChange('simple')}
                            className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all ${productType === 'simple' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-primary/30 bg-card hover:bg-muted/30 text-muted-foreground'}`}
                        >
                            <Package className={`h-8 w-8 mb-2 ${productType === 'simple' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <h3 className={`font-semibold ${productType === 'simple' ? 'text-foreground' : ''}`}>Produit Simple</h3>
                            <p className="text-xs mt-1">Un produit classique avec un stock unique.</p>
                        </div>

                        <div
                            onClick={() => handleProductTypeChange('variable')}
                            className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all ${productType === 'variable' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-primary/30 bg-card hover:bg-muted/30 text-muted-foreground'}`}
                        >
                            <Tags className={`h-8 w-8 mb-2 ${productType === 'variable' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <h3 className={`font-semibold ${productType === 'variable' ? 'text-foreground' : ''}`}>Avec Déclinaisons</h3>
                            <p className="text-xs mt-1">Gérez différentes tailles, couleurs ou options.</p>
                        </div>

                        <div
                            onClick={() => handleProductTypeChange('pack')}
                            className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all ${productType === 'pack' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-primary/30 bg-card hover:bg-muted/30 text-muted-foreground'}`}
                        >
                            <PackagePlus className={`h-8 w-8 mb-2 ${productType === 'pack' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <h3 className={`font-semibold ${productType === 'pack' ? 'text-foreground' : ''}`}>Pack / Recette</h3>
                            <p className="text-xs mt-1">Un ensemble (ex: menu) composé d'autres produits.</p>
                        </div>
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
                                            onChange={(e) => setData('prix_standard', e.target.value)}
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
                                    <ImageUpload value={data.image_url} onChange={(file) => setData('image_url', file)} />
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

                                {/* Simple mode: single stock input */}
                                {productType === 'simple' && (
                                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                                        <div className="mb-4">
                                            <p className="text-sm font-medium">Stock initial</p>
                                            <p className="text-xs text-muted-foreground">Définissez la quantité initiale en stock pour ce nouveau produit.</p>
                                        </div>
                                        <Label htmlFor="stock_initial">Quantité en stock</Label>
                                        <Input
                                            id="stock_initial"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            value={data.stock_initial}
                                            onChange={(e) => setData('stock_initial', Number(e.target.value))}
                                            className="mt-1 max-w-xs bg-background"
                                        />
                                    </div>
                                )}

                                {/* Variant mode or Pack mode: variant cards */}
                                {productType !== 'simple' && (
                                    <div className="space-y-4">
                                        {data.variantes.map((variante, index) => (
                                            <VariantCard
                                                key={index}
                                                index={index}
                                                variante={variante}
                                                attributs={attributs}
                                                availableVariantes={variantesDispo}
                                                categories={initialCategories}
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
                                                Ajouter une variante ou Pack
                                            </button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submit */}
                    <Button disabled={processing} type="submit" className="w-full">
                        {processing ? 'Enregistrement...' : 'Enregistrer le produit'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
