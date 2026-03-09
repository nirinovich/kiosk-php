import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import pos from '@/routes/pos';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Package,
    CheckCircle,
    User,
    X,
    Delete,
    Hash,
    ArrowLeft,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PosProduct {
    id_variante: number;
    nom: string;
    prix: number;
    stock: number;
    image_url: string | null;
    id_categorie: number | null;
    est_pack: boolean;
}

const resolveImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
        return null;
    }

    if (/^(https?:)?\/\//.test(imageUrl) || imageUrl.startsWith('/')) {
        return imageUrl;
    }

    return `/${imageUrl.replace(/^\/+/, '')}`;
};

interface Category {
    id_categorie: number;
    nom: string;
}

interface ClientOption {
    id_client: number;
    name: string;
}

interface OrderLine {
    id_variante: number;
    nom: string;
    prix_unitaire: number;
    quantite: number;
    stock: number;
    est_pack: boolean;
}

interface PageProps {
    produits: PosProduct[];
    categories: Category[];
    clients: ClientOption[];
    flash: { success?: string; message?: string };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Point de vente', href: pos.index().url },
];

const TVA_RATE = 20;

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PosIndex() {
    const { produits, categories, clients, flash } = usePage<PageProps>().props;

    // ── Order state ──
    const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [selectedLine, setSelectedLine] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<number | null>(null);
    const [clientSearch, setClientSearch] = useState('');
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [numpadMode, setNumpadMode] = useState<'qty' | 'price' | 'discount'>('qty');
    const [numpadBuffer, setNumpadBuffer] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ── Form ──
    const { post, processing } = useForm();

    // ── Flash message ──
    useEffect(() => {
        if (flash.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash.success]);

    // ── Product filtering ──
    const filteredProducts = useMemo(() => {
        let items = produits;
        if (selectedCategory !== null) {
            items = items.filter((p) => p.id_categorie === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter((p) => p.nom.toLowerCase().includes(q));
        }
        return items;
    }, [produits, selectedCategory, searchQuery]);

    // ── Client filtering ──
    const filteredClients = useMemo(() => {
        if (!clientSearch.trim()) return clients;
        const q = clientSearch.toLowerCase();
        return clients.filter((c) => c.name.toLowerCase().includes(q));
    }, [clients, clientSearch]);

    const selectedClientName = useMemo(() => {
        if (!selectedClient) return null;
        return clients.find((c) => c.id_client === selectedClient)?.name ?? null;
    }, [clients, selectedClient]);

    // ── Order operations ──
    const addProduct = useCallback((product: PosProduct) => {
        setOrderLines((prev) => {
            const existing = prev.findIndex((l) => l.id_variante === product.id_variante);
            if (existing >= 0) {
                return prev.map((l, i) =>
                    i === existing
                        ? { ...l, quantite: Math.min(l.quantite + 1, l.stock) }
                        : l
                );
            }
            return [
                ...prev,
                {
                    id_variante: product.id_variante,
                    nom: product.nom,
                    prix_unitaire: product.prix,
                    quantite: 1,
                    stock: product.stock,
                    est_pack: product.est_pack,
                },
            ];
        });
    }, []);

    const updateLineQuantity = useCallback((index: number, delta: number) => {
        setOrderLines((prev) =>
            prev
                .map((l, i) => {
                    if (i !== index) return l;
                    const newQty = l.quantite + delta;
                    if (newQty <= 0) return null;
                    return { ...l, quantite: Math.min(newQty, l.stock) };
                })
                .filter(Boolean) as OrderLine[]
        );
    }, []);

    const removeLine = useCallback((index: number) => {
        setOrderLines((prev) => prev.filter((_, i) => i !== index));
        setSelectedLine(null);
    }, []);

    const clearOrder = useCallback(() => {
        setOrderLines([]);
        setSelectedLine(null);
        setSelectedClient(null);
        setNumpadBuffer('');
    }, []);

    // ── Numpad ──
    const handleNumpadPress = useCallback(
        (key: string) => {
            if (selectedLine === null && key !== 'C') return;

            if (key === 'C') {
                setNumpadBuffer('');
                return;
            }

            if (key === '⌫') {
                setNumpadBuffer((prev) => prev.slice(0, -1));
                return;
            }

            // Dot: only one allowed
            if (key === '.' && numpadBuffer.includes('.')) return;

            const newBuffer = numpadBuffer + key;
            setNumpadBuffer(newBuffer);

            const value = parseFloat(newBuffer);
            if (isNaN(value)) return;

            if (numpadMode === 'qty') {
                setOrderLines((prev) =>
                    prev.map((l, i) =>
                        i === selectedLine
                            ? { ...l, quantite: Math.min(Math.max(1, Math.floor(value)), l.stock) }
                            : l
                    )
                );
            } else if (numpadMode === 'price') {
                setOrderLines((prev) =>
                    prev.map((l, i) =>
                        i === selectedLine ? { ...l, prix_unitaire: value } : l
                    )
                );
            }
        },
        [selectedLine, numpadMode, numpadBuffer]
    );

    const switchNumpadMode = useCallback((mode: 'qty' | 'price' | 'discount') => {
        setNumpadMode(mode);
        setNumpadBuffer('');
    }, []);

    // ── Totals ──
    const subtotal = useMemo(
        () => orderLines.reduce((sum, l) => sum + l.prix_unitaire * l.quantite, 0),
        [orderLines]
    );
    const tva = useMemo(() => subtotal * (TVA_RATE / 100), [subtotal]);
    const total = useMemo(() => subtotal + tva, [subtotal, tva]);

    // ── Submit ──
    function handleSubmit() {
        if (orderLines.length === 0 || processing) return;

        const payload = {
            id_client: selectedClient,
            lignes: orderLines.map((l) => ({
                id_variante: l.id_variante,
                quantite: l.quantite,
                prix_unitaire: l.prix_unitaire,
                taux_tva: TVA_RATE,
                remise_ligne: 0,
            })),
        };

        router.post(pos.store().url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                clearOrder();
            },
        });
    }

    // ── Format price ──
    const fmt = (n: number) =>
        new Intl.NumberFormat('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' MGA';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point de vente" />

            {/* Success toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-2">
                    <CheckCircle className="h-4 w-4" />
                    {flash.success}
                </div>
            )}

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* ═══════════ LEFT PANEL — Order ═══════════ */}
                <div className="flex w-[380px] shrink-0 flex-col border-r border-border bg-card">
                    {/* Order header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <h2 className="text-sm font-semibold">Commande en cours</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            {orderLines.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearOrder}
                                    className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Vider
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Client selector */}
                    <div className="border-b border-border px-4 py-2">
                        {showClientPicker ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Rechercher un client..."
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="h-8 text-sm"
                                        autoFocus
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={() => {
                                            setShowClientPicker(false);
                                            setClientSearch('');
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="max-h-32 overflow-y-auto rounded-md border border-border">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedClient(null);
                                            setShowClientPicker(false);
                                            setClientSearch('');
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent"
                                    >
                                        Aucun client
                                    </button>
                                    {filteredClients.map((c) => (
                                        <button
                                            key={c.id_client}
                                            type="button"
                                            onClick={() => {
                                                setSelectedClient(c.id_client);
                                                setShowClientPicker(false);
                                                setClientSearch('');
                                            }}
                                            className={`w-full px-3 py-1.5 text-left text-sm hover:bg-accent ${
                                                selectedClient === c.id_client
                                                    ? 'bg-accent font-medium'
                                                    : ''
                                            }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowClientPicker(true)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                <User className="h-4 w-4" />
                                {selectedClientName ?? 'Sélectionner un client'}
                            </button>
                        )}
                    </div>

                    {/* Order lines */}
                    <div className="flex-1 overflow-y-auto">
                        {orderLines.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                <ShoppingCart className="h-10 w-10 opacity-30" />
                                <p className="text-sm">Commande vide</p>
                                <p className="text-xs">Cliquez sur un produit pour l&apos;ajouter</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {orderLines.map((line, index) => (
                                    <button
                                        key={line.id_variante}
                                        type="button"
                                        onClick={() => {
                                            setSelectedLine(selectedLine === index ? null : index);
                                            setNumpadBuffer('');
                                        }}
                                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                            selectedLine === index
                                                ? 'bg-primary/10 ring-1 ring-inset ring-primary/30'
                                                : 'hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                                            {line.quantite}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium">{line.nom}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {fmt(line.prix_unitaire)} × {line.quantite}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {fmt(line.prix_unitaire * line.quantite)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeLine(index);
                                                }}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Numpad + Totals */}
                    <div className="border-t border-border">
                        {/* Numpad mode selector */}
                        {selectedLine !== null && (
                            <div className="border-b border-border px-4 py-2">
                                <div className="flex gap-1">
                                    {(['qty', 'price', 'discount'] as const).map((mode) => (
                                        <Button
                                            key={mode}
                                            variant={numpadMode === mode ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex-1 text-xs"
                                            onClick={() => switchNumpadMode(mode)}
                                        >
                                            {mode === 'qty' ? 'Qté' : mode === 'price' ? 'Prix' : 'Remise'}
                                        </Button>
                                    ))}
                                </div>
                                {numpadBuffer && (
                                    <p className="mt-1 text-center text-xs text-muted-foreground">
                                        {numpadMode === 'qty' ? 'Quantité' : numpadMode === 'price' ? 'Prix' : 'Remise'}: {numpadBuffer}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Numpad grid */}
                        {selectedLine !== null && (
                            <div className="grid grid-cols-4 gap-1 px-4 py-2">
                                {['1', '2', '3', '⌫', '4', '5', '6', 'C', '7', '8', '9', '.', '+1', '0', '-1'].map(
                                    (key) => (
                                        <Button
                                            key={key}
                                            variant={key === 'C' ? 'destructive' : 'outline'}
                                            size="sm"
                                            className="h-10 text-sm font-medium"
                                            onClick={() => {
                                                if (key === '+1') updateLineQuantity(selectedLine, 1);
                                                else if (key === '-1') updateLineQuantity(selectedLine, -1);
                                                else handleNumpadPress(key);
                                            }}
                                        >
                                            {key === '⌫' ? <Delete className="h-4 w-4" /> : key}
                                        </Button>
                                    )
                                )}
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-1 px-4 py-3">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Sous-total</span>
                                <span>{fmt(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>TVA ({TVA_RATE}%)</span>
                                <span>{fmt(tva)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">{fmt(total)}</span>
                            </div>
                        </div>

                        {/* Pay button */}
                        <div className="px-4 pb-4">
                            <Button
                                className="w-full h-12 text-base font-semibold"
                                size="lg"
                                disabled={orderLines.length === 0 || processing}
                                onClick={handleSubmit}
                            >
                                {processing ? (
                                    'Traitement...'
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Valider — {fmt(total)}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ═══════════ RIGHT PANEL — Products ═══════════ */}
                <div className="flex flex-1 flex-col overflow-hidden bg-background">
                    {/* Search bar */}
                    <div className="border-b border-border px-4 py-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Rechercher un produit..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                                    onClick={() => {
                                        setSearchQuery('');
                                        searchInputRef.current?.focus();
                                    }}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Category tabs */}
                    <div className="border-b border-border px-4 py-2">
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <Button
                                variant={selectedCategory === null ? 'default' : 'outline'}
                                size="sm"
                                className="shrink-0 text-xs"
                                onClick={() => setSelectedCategory(null)}
                            >
                                Tous
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id_categorie}
                                    variant={selectedCategory === cat.id_categorie ? 'default' : 'outline'}
                                    size="sm"
                                    className="shrink-0 text-xs"
                                    onClick={() =>
                                        setSelectedCategory(
                                            selectedCategory === cat.id_categorie ? null : cat.id_categorie
                                        )
                                    }
                                >
                                    {cat.nom}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {filteredProducts.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Package className="h-12 w-12 opacity-30" />
                                <p className="text-sm font-medium">Aucun produit trouvé</p>
                                {searchQuery && (
                                    <p className="text-xs">
                                        Essayez avec un autre terme de recherche
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {filteredProducts.map((product) => {
                                    const inOrder = orderLines.find(
                                        (l) => l.id_variante === product.id_variante
                                    );
                                    const isLowStock = product.stock <= 5;

                                    return (
                                        <button
                                            key={product.id_variante}
                                            type="button"
                                            onClick={() => addProduct(product)}
                                            disabled={inOrder ? inOrder.quantite >= product.stock : false}
                                            className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                                                inOrder ? 'ring-2 ring-primary/40' : ''
                                            }`}
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                                {product.image_url ? (
                                                    <img
                                                        src={resolveImageUrl(product.image_url) ?? undefined}
                                                        alt={product.nom}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-8 w-8 text-muted-foreground/40" />
                                                    </div>
                                                )}

                                                {/* LE BADGE PACK */}
                                                {product.est_pack && (
                                                    <div className="absolute top-1.5 left-1.5 z-10">
                                                        <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] px-1.5 py-0 shadow border-none">
                                                            PACK
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Quantity badge */}
                                                {inOrder && (
                                                    <div className="absolute top-1.5 right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow">
                                                        {inOrder.quantite}
                                                    </div>
                                                )}

                                                {/* Low stock badge */}
                                                {isLowStock && (
                                                    <div className="absolute bottom-1.5 left-1.5">
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-[10px] px-1.5 py-0"
                                                        >
                                                            {product.stock} en stock
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex flex-1 flex-col gap-1 p-2.5">
                                                <p className="line-clamp-2 text-left text-xs font-medium leading-tight">
                                                    {product.nom}
                                                </p>
                                                <p className="mt-auto text-left text-sm font-bold text-primary">
                                                    {fmt(product.prix)}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
